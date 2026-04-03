const questionsModel = require("../../../models/questions.model");

const FIXED_MAX_SCORE_BY_SUBTYPE = {
  read_aloud: 100,
  repeat_sentence: 100,
  describe_image: 100,
  respond_to_situation: 100,
  answer_short_question: 100,
  summarize_written_text: 8,
  write_email: 15,
  summarize_spoken_text: 10,
  mcq_single: 1,
  listening_multiple_choice_single_answers: 1,
};

const SECTION_LABELS = {
  listening: "Listening",
  reading: "Reading",
  speaking: "Speaking",
  writing: "Writing",
};

const SECTION_ORDER = ["listening", "reading", "speaking", "writing"];

const TASK_SUBTYPE_METADATA = {
  read_aloud: {
    label: "Read Aloud",
    communicativeSkills: ["reading", "speaking"],
  },
  repeat_sentence: {
    label: "Repeat Sentence",
    communicativeSkills: ["listening", "speaking"],
  },
  describe_image: {
    label: "Describe Image",
    communicativeSkills: ["speaking"],
  },
  respond_to_situation: {
    label: "Respond to a Situation",
    communicativeSkills: ["speaking"],
  },
  answer_short_question: {
    label: "Answer Short Question",
    communicativeSkills: ["listening", "speaking"],
  },
  summarize_written_text: {
    label: "Summarize Written Text",
    communicativeSkills: ["reading", "writing"],
  },
  write_email: {
    label: "Write Email",
    communicativeSkills: ["writing"],
  },
  rw_fill_in_the_blanks: {
    label: "Reading & Writing: Fill in the Blanks",
    communicativeSkills: ["reading", "writing"],
  },
  mcq_multiple: {
    label: "Multiple Choice, Multiple Answers",
    communicativeSkills: ["reading"],
  },
  reorder_paragraphs: {
    label: "Re-order Paragraphs",
    communicativeSkills: ["reading"],
  },
  reading_fill_in_the_blanks: {
    label: "Reading: Fill in the Blanks",
    communicativeSkills: ["reading"],
  },
  mcq_single: {
    label: "Multiple Choice, Single Answer",
    communicativeSkills: ["reading"],
  },
  summarize_spoken_text: {
    label: "Summarize Spoken Text",
    communicativeSkills: ["listening", "writing"],
  },
  listening_fill_in_the_blanks: {
    label: "Listening: Fill in the Blanks",
    communicativeSkills: ["listening", "writing"],
  },
  listening_multiple_choice_multiple_answers: {
    label: "Listening: Multiple Choice, Multiple Answers",
    communicativeSkills: ["listening"],
  },
  listening_multiple_choice_single_answers: {
    label: "Listening: Multiple Choice, Single Answer",
    communicativeSkills: ["listening"],
  },
};

const SKILL_PROFILE_GROUPS = [
  {
    key: "open_response_speaking_writing",
    label: "Open Response Speaking and Writing",
    subtypes: [
      "respond_to_situation",
      "answer_short_question",
      "summarize_written_text",
      "write_email",
      "summarize_spoken_text",
    ],
  },
  {
    key: "reproducing_spoken_written_language",
    label: "Reproducing Spoken and Written Language",
    subtypes: ["read_aloud", "repeat_sentence"],
  },
  {
    key: "extended_writing",
    label: "Extended Writing",
    subtypes: ["write_email"],
  },
  {
    key: "short_writing",
    label: "Short Writing",
    subtypes: ["summarize_written_text", "summarize_spoken_text"],
  },
  {
    key: "extended_speaking",
    label: "Extended Speaking",
    subtypes: ["read_aloud", "respond_to_situation"],
  },
  {
    key: "short_speaking",
    label: "Short Speaking",
    subtypes: ["repeat_sentence", "answer_short_question"],
  },
  {
    key: "multiple_skills_comprehension",
    label: "Multiple-skills Comprehension",
    subtypes: [
      "read_aloud",
      "repeat_sentence",
      "respond_to_situation",
      "answer_short_question",
      "summarize_written_text",
      "summarize_spoken_text",
    ],
  },
  {
    key: "single_skill_comprehension",
    label: "Single-skill Comprehension",
    subtypes: [
      "mcq_multiple",
      "reorder_paragraphs",
      "reading_fill_in_the_blanks",
      "mcq_single",
      "listening_fill_in_the_blanks",
      "listening_multiple_choice_multiple_answers",
      "listening_multiple_choice_single_answers",
    ],
  },
];

function average(values) {
  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!numericValues.length) return 0;
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAttemptId(value) {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim();
  return normalizedValue || null;
}

function getQuestionMaxScore(subtype, question) {
  if (FIXED_MAX_SCORE_BY_SUBTYPE[subtype]) {
    return FIXED_MAX_SCORE_BY_SUBTYPE[subtype];
  }

  if (!question) return 1;

  switch (subtype) {
    case "mcq_multiple":
    case "listening_multiple_choice_multiple_answers":
      return Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
        ? question.correctAnswers.length
        : 1;

    case "reading_fill_in_the_blanks":
    case "rw_fill_in_the_blanks":
    case "listening_fill_in_the_blanks":
      return Array.isArray(question.blanks) && question.blanks.length > 0
        ? question.blanks.length
        : 1;

    case "reorder_paragraphs":
      return Array.isArray(question.options) && question.options.length > 0
        ? question.options.length
        : 1;

    default:
      return 1;
  }
}

function normalizeToPteScore(rawScore, maxScore) {
  const numericRawScore = Number(rawScore);
  if (!Number.isFinite(numericRawScore) || maxScore <= 0) {
    return null;
  }

  const ratio = clamp(numericRawScore / maxScore, 0, 1);
  return 10 + ratio * 80;
}

function buildLatestAttemptMap(results = [], attemptId = null) {
  const latestAttempts = new Map();
  const normalizedAttemptId = normalizeAttemptId(attemptId);

  results.forEach((result) => {
    result.attempts.forEach((attempt) => {
      if (
        normalizedAttemptId &&
        normalizeAttemptId(attempt.attemptId) !== normalizedAttemptId
      ) {
        return;
      }

      const questionId = String(attempt.questionId);
      const submittedAt = new Date(attempt.submittedAt || 0).getTime();
      const existingAttempt = latestAttempts.get(questionId);

      if (!existingAttempt || submittedAt >= existingAttempt.submittedAt) {
        latestAttempts.set(questionId, {
          type: result.type,
          questionId,
          questionSubtype: attempt.questionSubtype,
          score: attempt.score,
          submittedAt,
        });
      }
    });
  });

  return latestAttempts;
}

function getRoundedSectionScore(scores) {
  if (!scores.length) return null;
  return Math.round(average(scores));
}

function buildSkillProfileBuckets() {
  return Object.fromEntries(
    SKILL_PROFILE_GROUPS.map((group) => [group.key, []])
  );
}

function buildSkillProfiles(profileBuckets) {
  return SKILL_PROFILE_GROUPS.map((group) => {
    const scores = profileBuckets[group.key] || [];

    return {
      key: group.key,
      label: group.label,
      score: scores.length ? Math.round(average(scores)) : null,
      assessedCount: scores.length,
    };
  });
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackSubtypeLabel(subtype) {
  return String(subtype || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTaskSubtypeMetadata(subtype) {
  return (
    TASK_SUBTYPE_METADATA[subtype] || {
      label: fallbackSubtypeLabel(subtype),
      communicativeSkills: [],
    }
  );
}

function truncateText(value, maxLength = 84) {
  const normalizedValue = normalizeWhitespace(value);
  if (!normalizedValue) return "";
  if (normalizedValue.length <= maxLength) return normalizedValue;
  return `${normalizedValue.slice(0, maxLength - 3).trim()}...`;
}

function getQuestionTitle(question, subtype) {
  const metadata = getTaskSubtypeMetadata(subtype);
  const candidateTitle = [
    question?.heading,
    question?.prompt,
    question?.text,
    question?.audioConvertedText,
  ]
    .map((value) => truncateText(value))
    .find(Boolean);

  return candidateTitle || metadata.label;
}

function buildCommunicativeSkillRows(communicativeSkills = [], taskScore = null) {
  return communicativeSkills.map((skillKey) => ({
    key: skillKey,
    label: SECTION_LABELS[skillKey] || fallbackSubtypeLabel(skillKey),
    score: taskScore,
  }));
}

function sortSectionTasks(tasks = []) {
  return [...tasks].sort((leftTask, rightTask) => {
    const leftSubmittedAt = new Date(leftTask.submittedAt || 0).getTime();
    const rightSubmittedAt = new Date(rightTask.submittedAt || 0).getTime();

    if (
      Number.isFinite(leftSubmittedAt) &&
      Number.isFinite(rightSubmittedAt) &&
      leftSubmittedAt !== rightSubmittedAt
    ) {
      return leftSubmittedAt - rightSubmittedAt;
    }

    const leftQuestionNumber = Number(leftTask.questionNumber);
    const rightQuestionNumber = Number(rightTask.questionNumber);

    if (
      Number.isFinite(leftQuestionNumber) &&
      Number.isFinite(rightQuestionNumber) &&
      leftQuestionNumber !== rightQuestionNumber
    ) {
      return leftQuestionNumber - rightQuestionNumber;
    }

    return String(leftTask.title || "").localeCompare(
      String(rightTask.title || "")
    );
  });
}

function buildEmptyFormattedMockTestResult(referenceDate = null) {
  const sections = SECTION_ORDER.map((sectionKey) => ({
    key: sectionKey,
    label: SECTION_LABELS[sectionKey],
    score: null,
    taskCount: 0,
    tasks: [],
  }));

  return {
    speaking: null,
    listening: null,
    reading: null,
    writing: null,
    totalScore: null,
    skillsProfile: buildSkillProfiles(buildSkillProfileBuckets()),
    sections,
    availableSections: [],
    completedTaskCount: 0,
    testDate: new Date(referenceDate || Date.now()).toISOString(),
  };
}

async function buildFormattedMockTestResult(mockTestResultDoc, options = {}) {
  const { attemptId = null, referenceDate = null } = options;

  if (!mockTestResultDoc) {
    return buildEmptyFormattedMockTestResult(referenceDate);
  }

  const latestAttempts = buildLatestAttemptMap(mockTestResultDoc.results, attemptId);
  const questionIds = [...latestAttempts.keys()];

  if (!questionIds.length) {
    return buildEmptyFormattedMockTestResult(
      referenceDate || mockTestResultDoc.createdAt || Date.now()
    );
  }

  const questions = await questionsModel.find(
    { _id: { $in: questionIds } },
    {
      correctAnswers: 1,
      blanks: 1,
      options: 1,
      heading: 1,
      prompt: 1,
      text: 1,
      audioConvertedText: 1,
      questionNumber: 1,
      subtype: 1,
      type: 1,
    }
  ).lean();

  const questionMap = new Map(
    questions.map((question) => [String(question._id), question])
  );

  const sectionBuckets = {
    speaking: [],
    listening: [],
    reading: [],
    writing: [],
  };
  const sectionTasks = {
    speaking: [],
    listening: [],
    reading: [],
    writing: [],
  };
  const skillProfileBuckets = buildSkillProfileBuckets();
  const overallTaskScores = [];
  let latestSubmittedAt = null;

  latestAttempts.forEach((attempt) => {
    const question = questionMap.get(attempt.questionId);
    const maxScore = getQuestionMaxScore(attempt.questionSubtype, question);
    const normalizedScore = normalizeToPteScore(attempt.score, maxScore);

    if (normalizedScore !== null) {
      const roundedTaskScore = Math.round(normalizedScore);
      const taskMetadata = getTaskSubtypeMetadata(attempt.questionSubtype);
      const submittedAt = attempt.submittedAt
        ? new Date(attempt.submittedAt).toISOString()
        : null;

      overallTaskScores.push(normalizedScore);

      if (sectionBuckets[attempt.type]) {
        sectionBuckets[attempt.type].push(normalizedScore);
      }

      if (sectionTasks[attempt.type]) {
        sectionTasks[attempt.type].push({
          questionId: attempt.questionId,
          questionNumber: question?.questionNumber ?? null,
          reference: Number.isFinite(Number(question?.questionNumber))
            ? `#${question.questionNumber}`
            : null,
          title: getQuestionTitle(question, attempt.questionSubtype),
          subtype: attempt.questionSubtype,
          subtypeLabel: taskMetadata.label,
          rawScore: Number.isFinite(Number(attempt.score))
            ? Number(attempt.score)
            : 0,
          maxScore,
          score: roundedTaskScore,
          communicativeSkills: buildCommunicativeSkillRows(
            taskMetadata.communicativeSkills,
            roundedTaskScore
          ),
          submittedAt,
        });
      }

      SKILL_PROFILE_GROUPS.forEach((group) => {
        if (group.subtypes.includes(attempt.questionSubtype)) {
          skillProfileBuckets[group.key].push(normalizedScore);
        }
      });

      const attemptSubmittedAt = new Date(attempt.submittedAt || 0).getTime();
      if (
        Number.isFinite(attemptSubmittedAt) &&
        (!latestSubmittedAt || attemptSubmittedAt > latestSubmittedAt)
      ) {
        latestSubmittedAt = attemptSubmittedAt;
      }
    }
  });

  const speaking = getRoundedSectionScore(sectionBuckets.speaking);
  const listening = getRoundedSectionScore(sectionBuckets.listening);
  const reading = getRoundedSectionScore(sectionBuckets.reading);
  const writing = getRoundedSectionScore(sectionBuckets.writing);

  // The overall score should reflect performance across all completed tasks,
  // not a simple average of the 4 communicative skill scores.
  const totalScore = overallTaskScores.length
    ? Math.round(average(overallTaskScores))
    : null;
  const skillsProfile = buildSkillProfiles(skillProfileBuckets);
  const sections = SECTION_ORDER.map((sectionKey) => ({
    key: sectionKey,
    label: SECTION_LABELS[sectionKey],
    score: getRoundedSectionScore(sectionBuckets[sectionKey]),
    taskCount: sectionTasks[sectionKey].length,
    tasks: sortSectionTasks(sectionTasks[sectionKey]),
  }));
  const completedTaskCount = sections.reduce(
    (total, section) => total + section.taskCount,
    0
  );

  return {
    speaking,
    listening,
    reading,
    writing,
    totalScore,
    skillsProfile,
    sections,
    availableSections: sections
      .filter((section) => section.taskCount > 0)
      .map((section) => section.key),
    completedTaskCount,
    testDate: latestSubmittedAt
      ? new Date(latestSubmittedAt).toISOString()
      : new Date(mockTestResultDoc.createdAt || Date.now()).toISOString(),
  };
}

module.exports = {
  buildEmptyFormattedMockTestResult,
  buildFormattedMockTestResult,
};
