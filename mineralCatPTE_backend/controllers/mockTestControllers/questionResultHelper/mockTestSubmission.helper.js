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

function average(values = []) {
  const numericValues = values.filter((value) => Number.isFinite(value));
  if (!numericValues.length) return 0;

  return (
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
  );
}

function getSpeechScorePayload(scoreData = {}) {
  return scoreData?.data && typeof scoreData.data === "object"
    ? scoreData.data
    : scoreData;
}

function getMockQuestionScore(subtype, scoreData = {}) {
  const normalizedAssessmentScore = Number(scoreData?.assessment?.score);
  if (Number.isFinite(normalizedAssessmentScore)) {
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

    case "reading_fill_in_the_blanks":
    case "listening_fill_in_the_blanks":
    case "listening_multiple_choice_multiple_answers":
    case "listening_multiple_choice_single_answers":
      return typeof scoreData?.result?.score === "number"
        ? scoreData.result.score
        : 0;

    case "summarize_spoken_text":
      return typeof scoreData?.summarize_text_score?.total_score === "number"
        ? scoreData.summarize_text_score.total_score
        : 0;

    default:
      console.warn("Unhandled subtype:", subtype);
      return 0;
  }
}

module.exports = {
  getMockQuestionScore,
  hasAttemptForAttemptId,
  hasMeaningfulAnswer,
  isAnsweredMockSubmission,
  normalizeAttemptId,
  parseSerializedRequestData,
};
