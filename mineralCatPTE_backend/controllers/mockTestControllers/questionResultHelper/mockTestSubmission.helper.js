function parseSerializedRequestData(payload = {}) {
  const normalizedPayload = { ...payload };

  Object.keys(normalizedPayload).forEach((key) => {
    const value = normalizedPayload[key];
    if (typeof value !== "string") {
      return;
    }

    const trimmedValue = value.trim();
    if (
      (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
      (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
    ) {
      try {
        normalizedPayload[key] = JSON.parse(trimmedValue);
      } catch (error) {
        console.warn(`Failed to parse ${key} as JSON`);
      }
    }
  });

  return normalizedPayload;
}

function normalizeAttemptId(value) {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim();
  return normalizedValue || null;
}

function hasMeaningfulAnswer(value) {
  if (value == null) return false;

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) return false;

    const loweredValue = normalizedValue.toLowerCase();
    if (
      loweredValue === "null" ||
      loweredValue === "undefined" ||
      loweredValue === "[]" ||
      loweredValue === "{}"
    ) {
      return false;
    }

    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulAnswer(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => hasMeaningfulAnswer(item));
  }

  if (typeof value === "number") {
    // Numeric placeholders (for example blank indexes) are not answers by themselves.
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return Boolean(value);
}

function isAnsweredMockSubmission({ answer, file } = {}) {
  if (file) {
    const fileSize = Number(file.size);

    if (Number.isFinite(fileSize)) {
      return fileSize > 0;
    }

    return Boolean(file.path || file.filename || file.originalname);
  }

  return hasMeaningfulAnswer(answer);
}

function hasAttemptForAttemptId(mockTestResult, attemptId) {
  const normalizedAttemptId = normalizeAttemptId(attemptId);

  if (!mockTestResult) {
    return false;
  }

  if (!normalizedAttemptId) {
    return Boolean(mockTestResult);
  }

  return Array.isArray(mockTestResult.results) && mockTestResult.results.some(
    (result) =>
      Array.isArray(result.attempts) &&
      result.attempts.some(
        (attempt) => normalizeAttemptId(attempt.attemptId) === normalizedAttemptId
      )
  );
}

function isRetryableMockResultWriteError(error) {
  if (!error) return false;

  return error.name === "VersionError" || error.code === 11000;
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function getMockResultRetryDelayMs(retryIndex) {
  const baseDelayMs = 40;
  const exponentialDelayMs = baseDelayMs * (2 ** retryIndex);
  const cappedDelayMs = Math.min(exponentialDelayMs, 1000);
  const jitterMs = Math.floor(Math.random() * 40);

  return cappedDelayMs + jitterMs;
}

async function persistMockTestAttemptWithRetry({
  mockTestResultModel,
  userId,
  mockTestId,
  questionType,
  attempt,
  maxRetries = 8,
} = {}) {
  const normalizedAttemptId = normalizeAttemptId(attempt?.attemptId);
  const questionId = attempt?.questionId ? String(attempt.questionId) : null;

  for (let retryIndex = 0; retryIndex <= maxRetries; retryIndex += 1) {
    const currentDoc = await mockTestResultModel.findOne({
      user: userId,
      mockTest: mockTestId,
    });

    if (!currentDoc) {
      try {
        await mockTestResultModel.create({
          user: userId,
          mockTest: mockTestId,
          results: [
            {
              type: questionType,
              averageScore: attempt.score,
              attempts: [attempt],
            },
          ],
        });
        return;
      } catch (error) {
        if (
          isRetryableMockResultWriteError(error) &&
          retryIndex < maxRetries
        ) {
          await wait(getMockResultRetryDelayMs(retryIndex));
          continue;
        }

        throw error;
      }
    }

    const existingTypeResult = currentDoc.results.find(
      (result) => result.type === questionType
    );

    if (existingTypeResult) {
      const existingAttemptIndex =
        normalizedAttemptId && questionId
          ? existingTypeResult.attempts.findIndex((currentAttempt) => {
              if (String(currentAttempt.questionId) !== questionId) {
                return false;
              }

              return (
                normalizeAttemptId(currentAttempt.attemptId) === normalizedAttemptId
              );
            })
          : -1;

      if (existingAttemptIndex >= 0) {
        // Keep one latest submission per question for a specific attemptId.
        existingTypeResult.attempts[existingAttemptIndex] = attempt;
      } else {
        existingTypeResult.attempts.push(attempt);
      }

      const totalScore = existingTypeResult.attempts.reduce(
        (acc, currentAttempt) => acc + Number(currentAttempt.score || 0),
        0
      );
      existingTypeResult.averageScore =
        existingTypeResult.attempts.length > 0
          ? totalScore / existingTypeResult.attempts.length
          : 0;
    } else {
      currentDoc.results.push({
        type: questionType,
        averageScore: attempt.score,
        attempts: [attempt],
      });
    }

    try {
      await currentDoc.save();
      return;
    } catch (error) {
      if (
        isRetryableMockResultWriteError(error) &&
        retryIndex < maxRetries
      ) {
        await wait(getMockResultRetryDelayMs(retryIndex));
        continue;
      }

      throw error;
    }
  }
}

function average(values = []) {
  const numericValues = values.filter((value) => Number.isFinite(value));
  if (!numericValues.length) return 0;

  return (
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function getFirstFiniteNumber(...values) {
  for (const value of values) {
    const numericValue = toFiniteNumber(value);
    if (numericValue !== null) {
      return numericValue;
    }
  }

  return null;
}

function normalizeSkillScoreToPercent(score, maxScore = null) {
  const numericScore = toFiniteNumber(score);
  if (numericScore === null) return null;

  const numericMaxScore = toFiniteNumber(maxScore);
  if (numericMaxScore !== null && numericMaxScore > 0) {
    return clamp((numericScore / numericMaxScore) * 100, 0, 100);
  }

  if (numericScore >= 0 && numericScore <= 1) {
    return numericScore * 100;
  }

  return clamp(numericScore, 0, 100);
}

function getAssessmentAttemptDetails(scoreData = {}) {
  const assessment = scoreData?.assessment;
  if (!assessment || typeof assessment !== "object") {
    return {
      assessmentScore: null,
      assessmentMaxScore: null,
      skillScores: null,
    };
  }

  const assessmentScore = getFirstFiniteNumber(
    assessment.score,
    assessment.percentage,
    assessment.totalScore
  );
  const assessmentPercentage = toFiniteNumber(assessment.percentage);
  const assessmentMaxScore =
    toFiniteNumber(assessment.maxScore) ??
    (assessmentPercentage !== null ? 100 : null);

  const normalizedSkillScores = {
    speaking: null,
    listening: null,
    reading: null,
    writing: null,
  };

  if (Array.isArray(assessment.skills)) {
    assessment.skills.forEach((skill) => {
      const skillKey = String(skill?.key || "").trim().toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(normalizedSkillScores, skillKey)) {
        return;
      }

      const skillPercentage = toFiniteNumber(skill?.percentage);
      const normalizedPercent = normalizeSkillScoreToPercent(
        skill?.score ?? skillPercentage,
        skill?.maxScore ?? (skillPercentage !== null ? 100 : null)
      );

      if (normalizedPercent !== null) {
        normalizedSkillScores[skillKey] = Number(normalizedPercent.toFixed(2));
      }
    });
  }

  const hasSkillScore = Object.values(normalizedSkillScores).some(
    (value) => Number.isFinite(value)
  );

  return {
    assessmentScore,
    assessmentMaxScore,
    skillScores: hasSkillScore ? normalizedSkillScores : null,
  };
}

function getSpeechScorePayload(scoreData = {}) {
  return scoreData?.data && typeof scoreData.data === "object"
    ? scoreData.data
    : scoreData;
}

function getMockQuestionScore(subtype, scoreData = {}) {
  const normalizedAssessmentScore = toFiniteNumber(scoreData?.assessment?.score);
  if (normalizedAssessmentScore !== null) {
    return normalizedAssessmentScore;
  }

  switch (subtype) {
    case "read_aloud": {
      const responseData = getSpeechScorePayload(scoreData);
      const speaking = Number(responseData?.speakingScore);
      const reading = Number(responseData?.readingScore);
      return Math.round(average([speaking, reading]));
    }

    case "repeat_sentence": {
      const responseData = getSpeechScorePayload(scoreData);
      const speaking = Number(responseData?.speakingScore);
      const listening = Number(responseData?.listeningScore);

      if (Number.isFinite(speaking) || Number.isFinite(listening)) {
        return Math.round(average([speaking, listening]));
      }

      const pronunciation = Number(responseData?.pronunciation);
      return Number.isFinite(pronunciation) ? Math.round(pronunciation) : 0;
    }

    case "describe_image": {
      const responseData = getSpeechScorePayload(scoreData);
      const directTaskScore = getFirstFiniteNumber(
        responseData?.taskScore,
        responseData?.score,
        scoreData?.score,
        scoreData?.result?.score
      );

      if (directTaskScore !== null) {
        return Math.round(directTaskScore);
      }

      const speakingScore = getFirstFiniteNumber(
        responseData?.speakingScore,
        scoreData?.data?.speakingScore
      );

      return speakingScore !== null ? Math.round(speakingScore) : 0;
    }

    case "respond_to_situation": {
      const responseData = getSpeechScorePayload(scoreData);
      const taskScore = Number(responseData?.taskScore);
      if (Number.isFinite(taskScore)) {
        return taskScore;
      }

      const appropriacy = Number(responseData?.appropriacy) || 0;
      const fluency = Number(responseData?.fluency) || 0;
      const pronunciation = Number(responseData?.pronunciation) || 0;
      return Math.round(((appropriacy + fluency + pronunciation) / 15) * 100);
    }

    case "answer_short_question": {
      const responseData = scoreData?.data;
      const speakingScore = Number(responseData?.speakingScore);
      const listeningScore = Number(responseData?.listeningScore);

      if (Number.isFinite(speakingScore) || Number.isFinite(listeningScore)) {
        return Math.round(average([speakingScore, listeningScore]) * 100);
      }

      const speaking = Number(scoreData?.result?.Speaking);
      const listening = Number(scoreData?.result?.Listening);
      return Math.round(average([speaking, listening]) * 100);
    }

    case "summarize_written_text":
    case "write_email":
    case "mcq_multiple":
    case "reorder_paragraphs":
    case "mcq_single":
      return typeof scoreData?.score === "number" ? scoreData.score : 0;

    case "rw_fill_in_the_blanks":
    case "reading_fill_in_the_blanks":
    case "listening_fill_in_the_blanks":
    case "listening_multiple_choice_multiple_answers":
    case "listening_multiple_choice_single_answers":
      return (
        getFirstFiniteNumber(scoreData?.result?.score, scoreData?.score) ?? 0
      );

    case "summarize_spoken_text":
      return (
        getFirstFiniteNumber(
          scoreData?.summarize_text_score?.total_score,
          scoreData?.score,
          scoreData?.result?.score
        ) ?? 0
      );

    default:
      const fallbackScore = getFirstFiniteNumber(
        scoreData?.score,
        scoreData?.result?.score,
        scoreData?.data?.taskScore,
        scoreData?.data?.score,
        scoreData?.total_score
      );

      if (fallbackScore !== null) {
        return fallbackScore;
      }

      console.warn("Unhandled subtype:", subtype);
      return 0;
  }
}

module.exports = {
  getAssessmentAttemptDetails,
  getMockQuestionScore,
  hasAttemptForAttemptId,
  hasMeaningfulAnswer,
  isAnsweredMockSubmission,
  normalizeAttemptId,
  persistMockTestAttemptWithRetry,
  parseSerializedRequestData,
};
