function toNumber(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function roundScore(value, digits = 0) {
  const numericValue = toNumber(value);
  if (numericValue === null) return null;

  const factor = 10 ** digits;
  return Math.round(numericValue * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

  return roundScore(clamp((numericScore / numericMaxScore) * 100, 0, 100), 2);
}

function buildMetric({ key, label, score = null, maxScore = null, rawScore = null, format = "number" }) {
  const normalizedScore = toNumber(score);
  const normalizedMaxScore = toNumber(maxScore);
  const percentage = normalizedScore !== null && normalizedMaxScore !== null && normalizedMaxScore > 0
    ? toPercentage(normalizedScore, normalizedMaxScore)
    : null;

  return {
    key,
    label,
    score: normalizedScore,
    maxScore: normalizedMaxScore,
    percentage,
    rawScore,
    format,
  };
}

function buildAssessment({
  answered = true,
  skipped = false,
  questionType = "",
  subtype = "",
  title = "",
  score = null,
  maxScore = null,
  feedback = "",
  skills = [],
  traits = [],
  meta = {},
} = {}) {
  const normalizedScore = toNumber(score);
  const normalizedMaxScore = toNumber(maxScore);

  return {
    answered: Boolean(answered),
    skipped: Boolean(skipped),
    questionType,
    subtype,
    title,
    score: normalizedScore,
    maxScore: normalizedMaxScore,
    percentage: normalizedScore !== null && normalizedMaxScore !== null && normalizedMaxScore > 0
      ? toPercentage(normalizedScore, normalizedMaxScore)
      : null,
    feedback: feedback || "",
    skills,
    traits,
    meta,
  };
}

function buildReadAloudAssessment(data = {}) {
  const speakingScore = toNumber(data.speakingScore, 0);
  const readingScore = toNumber(data.readingScore, 0);

  return buildAssessment({
    questionType: "speaking",
    subtype: "read_aloud",
    title: "Read Aloud",
    score: average([speakingScore, readingScore]) ?? 0,
    maxScore: 100,
    skills: [
      buildMetric({ key: "speaking", label: "Speaking", score: speakingScore, maxScore: 100, format: "percent" }),
      buildMetric({ key: "reading", label: "Reading", score: readingScore, maxScore: 100, format: "percent" }),
    ],
    traits: [
      buildMetric({ key: "content", label: "Content", score: toNumber(data.content, 0), maxScore: 100, format: "percent" }),
      buildMetric({ key: "fluency", label: "Fluency", score: toNumber(data.fluency, 0), maxScore: 100, format: "percent" }),
      buildMetric({ key: "pronunciation", label: "Pronunciation", score: toNumber(data.pronunciation, 0), maxScore: 100, format: "percent" }),
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

function buildRepeatSentenceAssessment(data = {}) {
  const speakingScore = toNumber(data.speakingScore, 0);
  const listeningScore = toNumber(data.listeningScore, 0);

  return buildAssessment({
    questionType: "speaking",
    subtype: "repeat_sentence",
    title: "Repeat Sentence",
    score: average([speakingScore, listeningScore]) ?? 0,
    maxScore: 100,
    skills: [
      buildMetric({ key: "speaking", label: "Speaking", score: speakingScore, maxScore: 100, format: "percent" }),
      buildMetric({ key: "listening", label: "Listening", score: listeningScore, maxScore: 100, format: "percent" }),
    ],
    traits: [
      buildMetric({ key: "content", label: "Content", score: toNumber(data.content, 0), maxScore: 1, format: "ratio" }),
      buildMetric({ key: "fluency", label: "Fluency", score: toNumber(data.fluency, 0), maxScore: 100, format: "percent" }),
      buildMetric({ key: "pronunciation", label: "Pronunciation", score: toNumber(data.pronunciation, 0), maxScore: 100, format: "percent" }),
    ],
    meta: {
      totalWords: toNumber(data.totalWords, 0),
      goodWords: toNumber(data.goodWords, 0),
      averageWords: toNumber(data.averageWords, 0),
      badWords: toNumber(data.badWords, 0),
      predictedText: data.predictedText || data.transcript || "",
      transcript: data.transcript || data.predictedText || "",
      transcriptWords: Array.isArray(data.transcriptWords) ? data.transcriptWords : [],
      noSpeechDetected: Boolean(data.noSpeechDetected),
    },
  });
}

function buildRespondToSituationAssessment(data = {}) {
  const speakingScore = toNumber(data.speakingScore, 0);
  const listeningScore = toNumber(
    data.listeningScore,
    toNumber(data.taskScore, speakingScore)
  );

  return buildAssessment({
    questionType: "speaking",
    subtype: "respond_to_situation",
    title: "Respond to a Situation",
    score: toNumber(data.taskScore, 0),
    maxScore: 100,
    skills: [
      buildMetric({ key: "speaking", label: "Speaking", score: speakingScore, maxScore: 100, format: "percent" }),
      buildMetric({ key: "listening", label: "Listening", score: listeningScore, maxScore: 100, format: "percent" }),
    ],
    traits: [
      buildMetric({ key: "appropriacy", label: "Appropriacy", score: toNumber(data.appropriacy, 0), maxScore: toNumber(data.traitScaleMax, 5) || 5 }),
      buildMetric({ key: "pronunciation", label: "Pronunciation", score: toNumber(data.pronunciation, 0), maxScore: toNumber(data.traitScaleMax, 5) || 5 }),
      buildMetric({ key: "fluency", label: "Fluency", score: toNumber(data.fluency, 0), maxScore: toNumber(data.traitScaleMax, 5) || 5 }),
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
      noSpeechDetected: Boolean(data.noSpeechDetected),
      usedFallbackScoring: Boolean(data.usedFallbackScoring),
    },
  });
}

function buildAnswerShortQuestionAssessment(payload = {}) {
  const data = payload.data || {};
  const result = payload.result || {};
  const speakingRaw = toNumber(data.speakingScore, toNumber(result.Speaking, 0)) || 0;
  const listeningRaw = toNumber(data.listeningScore, toNumber(result.Listening, 0)) || 0;
  const fluencyRaw = toNumber(data.fluency, toNumber(result.Fluency, 0)) || 0;
  const pronunciationRaw = toNumber(data.pronunciation, toNumber(result.Pronunciation, 0)) || 0;

  return buildAssessment({
    questionType: "speaking",
    subtype: "answer_short_question",
    title: "Answer Short Question",
    score: roundScore((average([speakingRaw, listeningRaw]) ?? 0) * 100, 2),
    maxScore: 100,
    skills: [
      buildMetric({
        key: "speaking",
        label: "Speaking",
        score: roundScore(speakingRaw * 100, 2),
        maxScore: 100,
        rawScore: speakingRaw,
        format: "percent",
      }),
      buildMetric({
        key: "listening",
        label: "Listening",
        score: roundScore(listeningRaw * 100, 2),
        maxScore: 100,
        rawScore: listeningRaw,
        format: "percent",
      }),
    ],
    traits: [
      buildMetric({
        key: "fluency",
        label: "Fluency",
        score: roundScore(fluencyRaw * 100, 2),
        maxScore: 100,
        rawScore: fluencyRaw,
        format: "percent",
      }),
      buildMetric({
        key: "pronunciation",
        label: "Pronunciation",
        score: roundScore(pronunciationRaw * 100, 2),
        maxScore: 100,
        rawScore: pronunciationRaw,
        format: "percent",
      }),
    ],
    meta: {
      enablingSkills: data.enablingSkills ?? result.EnablingSkills ?? "NO",
    },
  });
}

function buildSummarizeWrittenTextAssessment(result = {}) {
  return buildAssessment({
    questionType: "writing",
    subtype: "summarize_written_text",
    title: "Summarize Written Text",
    score: toNumber(result.score, 0),
    maxScore: 8,
    feedback: result.feedback || "",
    traits: [
      buildMetric({ key: "content", label: "Content", score: toNumber(result.content, 0), maxScore: 2 }),
      buildMetric({ key: "form", label: "Form", score: toNumber(result.form, 0), maxScore: 2 }),
      buildMetric({ key: "grammar", label: "Grammar", score: toNumber(result.grammar, 0), maxScore: 2 }),
      buildMetric({ key: "vocabularyRange", label: "Vocabulary", score: toNumber(result.vocabularyRange, 0), maxScore: 2 }),
    ],
    meta: {
      wordCount: toNumber(result.wordCount, 0),
      noFurtherScoring: Boolean(result.noFurtherScoring),
      gatingReason: result.gatingReason || "",
    },
  });
}

function buildWriteEmailAssessment(result = {}) {
  return buildAssessment({
    questionType: "writing",
    subtype: "write_email",
    title: "Write Email",
    score: toNumber(result.score, 0),
    maxScore: 15,
    feedback: result.feedback || "",
    traits: [
      buildMetric({ key: "content", label: "Content", score: toNumber(result.content, 0), maxScore: 3 }),
      buildMetric({ key: "emailConvention", label: "Email Conventions", score: toNumber(result.emailConvention, 0), maxScore: 2 }),
      buildMetric({ key: "form", label: "Form", score: toNumber(result.form, 0), maxScore: 2 }),
      buildMetric({ key: "organization", label: "Organization", score: toNumber(result.organization, 0), maxScore: 2 }),
      buildMetric({ key: "vocabularyRange", label: "Vocabulary", score: toNumber(result.vocabularyRange, 0), maxScore: 2 }),
      buildMetric({ key: "grammar", label: "Grammar", score: toNumber(result.grammar, 0), maxScore: 2 }),
      buildMetric({ key: "spelling", label: "Spelling", score: toNumber(result.spelling, 0), maxScore: 2 }),
    ],
    meta: {
      wordCount: toNumber(result.wordCount, 0),
      noFurtherScoring: Boolean(result.noFurtherScoring),
      gatingReason: result.gatingReason || "",
    },
  });
}

function buildSummarizeSpokenTextAssessment(result = {}) {
  const scorePayload = result.summarize_text_score || {};
  const rubricScores = scorePayload.scores || {};
  const feedback = scorePayload.feedback?.overall
    || scorePayload.feedback?.strengths
    || scorePayload.feedback?.improvements
    || "";

  return buildAssessment({
    questionType: "listening",
    subtype: "summarize_spoken_text",
    title: "Summarize Spoken Text",
    score: toNumber(scorePayload.total_score, 0),
    maxScore: 10,
    feedback,
    traits: [
      buildMetric({ key: "content", label: "Content", score: toNumber(rubricScores.content, 0), maxScore: 2 }),
      buildMetric({ key: "form", label: "Form", score: toNumber(rubricScores.form, 0), maxScore: 2 }),
      buildMetric({ key: "grammar", label: "Grammar", score: toNumber(rubricScores.grammar, 0), maxScore: 2 }),
      buildMetric({ key: "spelling", label: "Spelling", score: toNumber(rubricScores.spelling, 0), maxScore: 2 }),
      buildMetric({ key: "vocabulary_range", label: "Vocabulary", score: toNumber(rubricScores.vocabulary_range, 0), maxScore: 2 }),
    ],
    meta: {
      wordCount: toNumber(scorePayload.word_count, 0),
      originalTranscript: result.original_transcript || "",
      userSummary: result.user_summary || "",
      feedback: scorePayload.feedback || {},
    },
  });
}

function buildObjectiveAssessment({
  questionType = "",
  subtype = "",
  title = "",
  score = 0,
  maxScore = 1,
  feedback = "",
  meta = {},
} = {}) {
  return buildAssessment({
    questionType,
    subtype,
    title,
    score: toNumber(score, 0),
    maxScore: toNumber(maxScore, 1),
    feedback,
    traits: [
      buildMetric({ key: "correct", label: "Correct", score: toNumber(score, 0), maxScore: toNumber(maxScore, 1) }),
    ],
    meta,
  });
}

module.exports = {
  buildAnswerShortQuestionAssessment,
  buildObjectiveAssessment,
  buildReadAloudAssessment,
  buildRepeatSentenceAssessment,
  buildRespondToSituationAssessment,
  buildSummarizeSpokenTextAssessment,
  buildSummarizeWrittenTextAssessment,
  buildWriteEmailAssessment,
};
