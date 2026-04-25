function toNumber(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function average(values = []) {
  const numericValues = values
    .map((value) => toNumber(value))
    .filter((value) => value !== null);

  if (!numericValues.length) return null;
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function toPercentage(score, maxScore) {
  const numericScore = toNumber(score);
  const numericMaxScore = toNumber(maxScore);

  if (numericScore === null || numericMaxScore === null || numericMaxScore <= 0) {
    return null;
  }

  return Math.round((numericScore / numericMaxScore) * 10000) / 100;
}

function createMetric(key, label, score, maxScore, extra = {}) {
  return {
    key,
    label,
    score: toNumber(score),
    maxScore: toNumber(maxScore),
    percentage: toPercentage(score, maxScore),
    ...extra,
  };
}

function buildAssessment({
  score = null,
  maxScore = null,
  percentage = null,
  feedback = "",
  skills = [],
  traits = [],
  meta = {},
} = {}) {
  const derivedPercentage =
    percentage ?? (toNumber(score) !== null && toNumber(maxScore) !== null
      ? toPercentage(score, maxScore)
      : null);

  return {
    score: toNumber(score),
    maxScore: toNumber(maxScore),
    percentage: toNumber(derivedPercentage),
    feedback: feedback || "",
    skills,
    traits,
    meta,
  };
}

function buildLegacyAssessment(serverResponse = {}, subtype = "") {
  const data = serverResponse?.data && typeof serverResponse.data === "object"
    ? serverResponse.data
    : {};
  const result = serverResponse?.result && typeof serverResponse.result === "object"
    ? serverResponse.result
    : {};

  switch (subtype) {
    case "read_aloud": {
      const speakingScore = toNumber(data.speakingScore, 0);
      const readingScore = toNumber(data.readingScore, 0);

      return buildAssessment({
        score: average([speakingScore, readingScore]) ?? 0,
        maxScore: 100,
        skills: [
          createMetric("speaking", "Speaking", speakingScore, 100),
          createMetric("reading", "Reading", readingScore, 100),
        ],
        traits: [
          createMetric("content", "Content", toNumber(data.content, 0), 100),
          createMetric("fluency", "Fluency", toNumber(data.fluency, 0), 100),
          createMetric("pronunciation", "Pronunciation", toNumber(data.pronunciation, 0), 100),
        ],
        meta: {
          totalWords: toNumber(data.totalWords, 0),
          goodWords: toNumber(data.goodWords, 0),
          averageWords: toNumber(data.averageWords, 0),
          badWords: toNumber(data.badWords, 0),
          transcript: data.transcript || "",
          transcriptWords: Array.isArray(data.transcriptWords) ? data.transcriptWords : [],
        },
      });
    }

    case "repeat_sentence": {
      const source = Object.keys(data).length ? data : serverResponse;
      const speakingScore = toNumber(source.speakingScore, 0);
      const listeningScore = toNumber(source.listeningScore, 0);

      return buildAssessment({
        score: average([speakingScore, listeningScore]) ?? 0,
        maxScore: 100,
        skills: [
          createMetric("speaking", "Speaking", speakingScore, 100),
          createMetric("listening", "Listening", listeningScore, 100),
        ],
        traits: [
          createMetric("content", "Content", toNumber(source.content, 0), 1),
          createMetric("fluency", "Fluency", toNumber(source.fluency, 0), 100),
          createMetric("pronunciation", "Pronunciation", toNumber(source.pronunciation, 0), 100),
        ],
        meta: {
          totalWords: toNumber(source.totalWords, 0),
          goodWords: toNumber(source.goodWords, 0),
          averageWords: toNumber(source.averageWords, 0),
          badWords: toNumber(source.badWords, 0),
          predictedText: source.predictedText || "",
        },
      });
    }

    case "respond_to_situation": {
      return buildAssessment({
        score: toNumber(data.taskScore, 0),
        maxScore: 100,
        skills: [createMetric("speaking", "Speaking", toNumber(data.speakingScore, 0), 100)],
        traits: [
          createMetric("appropriacy", "Appropriacy", toNumber(data.appropriacy, 0), toNumber(data.traitScaleMax, 5) || 5),
          createMetric("pronunciation", "Pronunciation", toNumber(data.pronunciation, 0), toNumber(data.traitScaleMax, 5) || 5),
          createMetric("fluency", "Fluency", toNumber(data.fluency, 0), toNumber(data.traitScaleMax, 5) || 5),
        ],
        meta: {
          taskScore: toNumber(data.taskScore, 0),
          totalTraitScore: toNumber(data.totalTraitScore, 0),
          traitScaleMax: toNumber(data.traitScaleMax, 5) || 5,
          totalWords: toNumber(data.totalWords, 0),
          goodWords: toNumber(data.goodWords, 0),
          averageWords: toNumber(data.averageWords, 0),
          badWords: toNumber(data.badWords, 0),
          predictedText: data.predictedText || "",
          relevanceClass: data.relevanceClass || null,
        },
      });
    }

    case "answer_short_question": {
      const speakingRaw = toNumber(data.speakingScore, toNumber(result.Speaking, 0)) || 0;
      const listeningRaw = toNumber(data.listeningScore, toNumber(result.Listening, 0)) || 0;
      const fluencyRaw = toNumber(data.fluency, toNumber(result.Fluency, 0)) || 0;
      const pronunciationRaw = toNumber(data.pronunciation, toNumber(result.Pronunciation, 0)) || 0;

      return buildAssessment({
        score: average([speakingRaw, listeningRaw]) ?? 0,
        maxScore: 1,
        skills: [
          createMetric("speaking", "Speaking", speakingRaw, 1, { rawScore: speakingRaw }),
          createMetric("listening", "Listening", listeningRaw, 1, { rawScore: listeningRaw }),
        ],
        traits: [
          createMetric("fluency", "Fluency", fluencyRaw, 1, { rawScore: fluencyRaw }),
          createMetric("pronunciation", "Pronunciation", pronunciationRaw, 1, { rawScore: pronunciationRaw }),
        ],
        meta: {
          enablingSkills: data.enablingSkills ?? result.EnablingSkills ?? "NO",
          predictedText: data.predictedText || "",
          correctText: data.correctText || "",
          matchedExpectedAnswer: Boolean(data.matchedExpectedAnswer),
        },
      });
    }

    case "summarize_written_text":
      return buildAssessment({
        score: serverResponse.score,
        maxScore: 8,
        feedback: serverResponse.feedback,
        traits: [
          createMetric("content", "Content", serverResponse.content, 2),
          createMetric("form", "Form", serverResponse.form, 2),
          createMetric("grammar", "Grammar", serverResponse.grammar, 2),
          createMetric("vocabularyRange", "Vocabulary", serverResponse.vocabularyRange, 2),
        ],
      });

    case "write_email":
      return buildAssessment({
        score: serverResponse.score,
        maxScore: 15,
        feedback: serverResponse.feedback,
        traits: [
          createMetric("content", "Content", serverResponse.content, 3),
          createMetric("emailConvention", "Email Conventions", serverResponse.emailConvention, 2),
          createMetric("form", "Form", serverResponse.form, 2),
          createMetric("organization", "Organization", serverResponse.organization, 2),
          createMetric("vocabularyRange", "Vocabulary", serverResponse.vocabularyRange, 2),
          createMetric("grammar", "Grammar", serverResponse.grammar, 2),
          createMetric("spelling", "Spelling", serverResponse.spelling, 2),
        ],
        meta: {
          wordCount: toNumber(serverResponse.wordCount, 0),
          noFurtherScoring: Boolean(serverResponse.noFurtherScoring),
          gatingReason: serverResponse.gatingReason || "",
        },
      });

    case "summarize_spoken_text": {
      const scorePayload = serverResponse.summarize_text_score || {};
      const rubricScores = scorePayload.scores || {};

      return buildAssessment({
        score: scorePayload.total_score,
        maxScore: 10,
        feedback:
          scorePayload.feedback?.overall ||
          scorePayload.feedback?.strengths ||
          scorePayload.feedback?.improvements ||
          "",
        traits: [
          createMetric("content", "Content", rubricScores.content, 2),
          createMetric("form", "Form", rubricScores.form, 2),
          createMetric("grammar", "Grammar", rubricScores.grammar, 2),
          createMetric("spelling", "Spelling", rubricScores.spelling, 2),
          createMetric("vocabulary_range", "Vocabulary", rubricScores.vocabulary_range, 2),
        ],
        meta: {
          wordCount: toNumber(scorePayload.word_count, 0),
          originalTranscript: serverResponse.original_transcript || "",
          userSummary: serverResponse.user_summary || "",
          feedback: scorePayload.feedback || {},
        },
      });
    }

    case "mcq_multiple":
    case "listening_multiple_choice_multiple_answers":
      return buildAssessment({
        score: serverResponse.result?.score ?? serverResponse.score,
        maxScore: serverResponse.result?.totalCorrectAnswers ?? serverResponse.totalCorrectAnswers,
        feedback: serverResponse.feedback,
        meta: {
          correctAnswersGiven:
            serverResponse.result?.correctAnswersGiven ?? serverResponse.correctAnswersGiven,
        },
      });

    case "mcq_single":
    case "listening_multiple_choice_single_answers":
      return buildAssessment({
        score: serverResponse.result?.score ?? serverResponse.score,
        maxScore: serverResponse.result?.totalCorrectAnswers ?? serverResponse.totalCorrectAnswers ?? 1,
        feedback: serverResponse.feedback || serverResponse.message,
        meta: {
          isCorrect: serverResponse.isCorrect ?? serverResponse.result?.correctAnswersGiven ?? false,
        },
      });

    case "reading_fill_in_the_blanks":
      return buildAssessment({
        score: serverResponse.result?.score,
        maxScore: serverResponse.result?.totalBlanks,
        feedback: serverResponse.feedback,
        meta: {
          totalBlanks: serverResponse.result?.totalBlanks,
        },
      });

    case "listening_fill_in_the_blanks":
      return buildAssessment({
        score: serverResponse.result?.score,
        maxScore: serverResponse.result?.totalCorrectAnswers,
        feedback: serverResponse.feedback,
        meta: {
          correctAnswersGiven: serverResponse.result?.correctAnswersGiven,
        },
      });

    case "reorder_paragraphs":
      return buildAssessment({
        score: serverResponse.score,
        maxScore: serverResponse.totalCorrectAnswers,
        feedback: serverResponse.message,
        meta: {
          userAnswer: serverResponse.userAnswer || [],
          correctAnswer: serverResponse.correctAnswer || [],
        },
      });

    default:
      return buildAssessment();
  }
}

export function getQuestionAssessment(serverResponse, subtype = "") {
  if (serverResponse?.assessment && typeof serverResponse.assessment === "object") {
    return serverResponse.assessment;
  }

  return buildLegacyAssessment(serverResponse, subtype);
}

export function getAssessmentMetric(assessment, key) {
  const skills = Array.isArray(assessment?.skills) ? assessment.skills : [];
  const traits = Array.isArray(assessment?.traits) ? assessment.traits : [];

  return [...skills, ...traits].find((metric) => metric?.key === key) || null;
}

export function getAssessmentSkill(assessment, key) {
  return (Array.isArray(assessment?.skills) ? assessment.skills : []).find(
    (metric) => metric?.key === key
  ) || null;
}

export function getAssessmentTrait(assessment, key) {
  return (Array.isArray(assessment?.traits) ? assessment.traits : []).find(
    (metric) => metric?.key === key
  ) || null;
}

export function getAssessmentMeta(assessment, key, fallback = null) {
  return assessment?.meta?.[key] ?? fallback;
}
