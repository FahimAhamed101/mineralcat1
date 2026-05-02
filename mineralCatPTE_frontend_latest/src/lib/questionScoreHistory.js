"use client";

import { getQuestionAssessment } from "@/lib/questionAssessment";

const SCORE_HISTORY_PREFIX = "question-score-history:v1";
export const QUESTION_SCORE_HISTORY_UPDATED_EVENT = "question-score-history-updated";
const MAX_HISTORY_ITEMS = 5;

const RESULT_ROUTE_TO_SUBTYPE = {
  "/test/speaking/read_aloud/result": "read_aloud",
  "/test/speaking/repeat_sentence/result": "repeat_sentence",
  "/test/speaking/respond-to-a-situation/result": "respond_to_situation",
  "/test/speaking/answer_short_question/result": "answer_short_question",
  "/test/reading/fill-in-the-blanks/result": "reading_fill_in_the_blanks",
  "/test/reading/reading-fill-in-the-blanks/result": "reading_fill_in_the_blanks",
  "/test/reading/mcq_multiple/result": "mcq_multiple",
  "/test/reading/mcq_single/result": "mcq_single",
  "/test/reading/reorder-paragraphs/result": "reorder_paragraphs",
  "/test/listening/summarize-spoken-text/result": "summarize_spoken_text",
  "/test/listening/listening-fill-in-the-blanks/result": "listening_fill_in_the_blanks",
  "/test/listening/multiple-choice-multiple-answers/result":
    "listening_multiple_choice_multiple_answers",
  "/test/listening/multiple-choice-single-answers/result":
    "listening_multiple_choice_single_answers",
  "/test/writing/summerize-written-text/result": "summarize_written_text",
  "/test/writing/write_email/result": "write_email",
};

const QUESTION_ROUTE_TO_SUBTYPE = {
  "speaking/read-aloud": "read_aloud",
  "speaking/repeat-sentence": "repeat_sentence",
  "speaking/respond-to-a-situation": "respond_to_situation",
  "speaking/answer-short-question": "answer_short_question",
  "reading/fill-in-the-blanks": "reading_fill_in_the_blanks",
  "reading/multiple-choice-and-answers": "mcq_multiple",
  "reading/multiple-choice-single-answer": "mcq_single",
  "reading/re-order-paragraphs": "reorder_paragraphs",
  "listening/summarize-spoken-text": "summarize_spoken_text",
  "listening/fill-in-the-blanks": "listening_fill_in_the_blanks",
  "listening/multiple-choice-and-answers":
    "listening_multiple_choice_multiple_answers",
  "listening/multiple-choice-single-answer":
    "listening_multiple_choice_single_answers",
  "writing/summarize-written-text": "summarize_written_text",
  "writing/write-email": "write_email",
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeNumericValue(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function humanizeSubtype(subtype = "") {
  return String(subtype || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatHistoryTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function sanitizeAssessment(assessment = {}, subtype = "") {
  return {
    questionType: assessment?.questionType || "",
    subtype: assessment?.subtype || subtype,
    title: assessment?.title || humanizeSubtype(subtype),
    score: normalizeNumericValue(assessment?.score, 0),
    maxScore: normalizeNumericValue(assessment?.maxScore, 0),
    percentage: normalizeNumericValue(assessment?.percentage, 0),
    feedback: assessment?.feedback || "",
    skills: Array.isArray(assessment?.skills) ? assessment.skills : [],
    traits: Array.isArray(assessment?.traits) ? assessment.traits : [],
    meta: assessment?.meta && typeof assessment.meta === "object" ? assessment.meta : {},
  };
}

function buildHistoryEntry({ subtype, payload }) {
  const assessment = sanitizeAssessment(
    getQuestionAssessment(payload, subtype),
    subtype
  );
  const createdAt = new Date();

  return {
    id: `${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: createdAt.toISOString(),
    timeLabel: formatHistoryTimestamp(createdAt),
    assessment,
  };
}

function extractQuestionIdFromBody(body) {
  if (!body) return null;

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body.get("questionId") || null;
  }

  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return body.get("questionId") || null;
  }

  if (typeof body === "string") {
    try {
      const parsedBody = JSON.parse(body);
      return parsedBody?.questionId || null;
    } catch {
      return null;
    }
  }

  if (typeof body === "object") {
    return body?.questionId || null;
  }

  return null;
}

function normalizeUrlPath(url = "") {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return "";
  }
}

export function getQuestionScoreHistoryStorageKey(questionId, subtype) {
  if (!questionId || !subtype) return "";
  return `${SCORE_HISTORY_PREFIX}:${subtype}:${questionId}`;
}

export function loadQuestionScoreHistory(questionId, subtype) {
  if (!isBrowser()) return [];

  const storageKey = getQuestionScoreHistoryStorageKey(questionId, subtype);
  if (!storageKey) return [];

  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function saveQuestionScoreHistoryEntry(questionId, subtype, entry) {
  if (!isBrowser()) return [];

  const storageKey = getQuestionScoreHistoryStorageKey(questionId, subtype);
  if (!storageKey) return [];

  const currentHistory = loadQuestionScoreHistory(questionId, subtype);
  const nextHistory = [entry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(storageKey, JSON.stringify(nextHistory));
  window.dispatchEvent(
    new CustomEvent(QUESTION_SCORE_HISTORY_UPDATED_EVENT, {
      detail: { questionId, subtype, storageKey },
    })
  );

  return nextHistory;
}

export function persistQuestionScoreHistoryFromResponse({ url, options, payload }) {
  if (!isBrowser() || !payload || typeof payload !== "object") return;

  const pathname = normalizeUrlPath(url);
  const subtype = RESULT_ROUTE_TO_SUBTYPE[pathname];
  const questionId = extractQuestionIdFromBody(options?.body);

  if (!subtype || !questionId) return;

  const entry = buildHistoryEntry({ subtype, payload });
  saveQuestionScoreHistoryEntry(questionId, subtype, entry);
}

export function getQuestionRouteHistoryContext(pathname = "") {
  const segments = String(pathname)
    .split("/")
    .filter(Boolean);

  if (segments.length !== 3) {
    return null;
  }

  const [section, taskSlug, questionId] = segments;
  if (!/^[a-f0-9]{24}$/i.test(questionId)) {
    return null;
  }

  const subtype = QUESTION_ROUTE_TO_SUBTYPE[`${section}/${taskSlug}`];
  if (!subtype) {
    return null;
  }

  return {
    section,
    taskSlug,
    questionId,
    subtype,
  };
}
