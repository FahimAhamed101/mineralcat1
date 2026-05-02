"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  QUESTION_SCORE_HISTORY_UPDATED_EVENT,
  getQuestionRouteHistoryContext,
  loadQuestionScoreHistory,
} from "@/lib/questionScoreHistory";

function formatNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";

  return Number.isInteger(numericValue)
    ? `${numericValue}`
    : numericValue.toFixed(2).replace(/\.?0+$/, "");
}

function formatMetric(metric = {}) {
  const score = formatNumber(metric?.score ?? 0);
  const maxScore = Number(metric?.maxScore);

  if (Number.isFinite(maxScore) && maxScore > 0) {
    return `${score}/${formatNumber(maxScore)}`;
  }

  return score;
}

function HistoryCard({ entry }) {
  const assessment = entry?.assessment || {};
  const skills = Array.isArray(assessment.skills) ? assessment.skills : [];
  const traits = Array.isArray(assessment.traits) ? assessment.traits : [];
  const metrics = [...skills, ...traits].slice(0, 4);
  const noSpeechDetected = Boolean(assessment?.meta?.noSpeechDetected);

  return (
    <div className="rounded-2xl border border-[#dfe7ef] bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {assessment?.title || assessment?.subtype || "Score"}
          </p>
          <p className="text-xs text-gray-400">{entry?.timeLabel || "-"}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[#7be4ec] px-4 py-2 text-[#0f766e]">
            <span className="text-sm font-semibold">Score</span>
            <span className="ml-2 text-lg font-bold">
              {formatNumber(assessment?.score ?? 0)}
              {Number(assessment?.maxScore) > 0 ? `/${formatNumber(assessment.maxScore)}` : ""}
            </span>
          </div>
          <div className="rounded-full bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#810000]">
            {formatNumber(assessment?.percentage ?? 0)}%
          </div>
        </div>
      </div>

      {metrics.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <div
              key={metric?.key || metric?.label}
              className="rounded-full bg-[#f8fafc] px-3 py-1.5 text-xs text-gray-700"
            >
              <span className="font-semibold">{metric?.label || metric?.key}</span>
              <span className="ml-2">{formatMetric(metric)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {noSpeechDetected ? (
        <p className="mt-3 text-xs font-medium text-amber-700">
          No speech detected for this attempt. All scores were recorded as 0.
        </p>
      ) : null}
    </div>
  );
}

export default function QuestionScoreHistory() {
  const pathname = usePathname();
  const routeContext = useMemo(
    () => getQuestionRouteHistoryContext(pathname),
    [pathname]
  );
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!routeContext || routeContext.subtype === "read_aloud") {
      setHistory([]);
      return;
    }

    setHistory(
      loadQuestionScoreHistory(routeContext.questionId, routeContext.subtype)
    );
  }, [routeContext]);

  useEffect(() => {
    if (!routeContext || routeContext.subtype === "read_aloud") return undefined;

    const handleHistoryUpdated = (event) => {
      if (
        event?.detail?.questionId !== routeContext.questionId ||
        event?.detail?.subtype !== routeContext.subtype
      ) {
        return;
      }

      setHistory(
        loadQuestionScoreHistory(routeContext.questionId, routeContext.subtype)
      );
    };

    window.addEventListener(
      QUESTION_SCORE_HISTORY_UPDATED_EVENT,
      handleHistoryUpdated
    );

    return () => {
      window.removeEventListener(
        QUESTION_SCORE_HISTORY_UPDATED_EVENT,
        handleHistoryUpdated
      );
    };
  }, [routeContext]);

  if (!routeContext || routeContext.subtype === "read_aloud" || !history.length) {
    return null;
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto px-4 pb-8">
      <div className="rounded-[28px] bg-[#edfdfd] p-5">
        <div className="mb-5 text-center">
          <h2 className="inline-block border-b-2 border-[#f5a267] px-4 pb-2 text-3xl font-semibold text-[#f5a267]">
            Score History
          </h2>
        </div>
        <div className="space-y-4">
          {history.map((entry) => (
            <HistoryCard key={entry?.id || entry?.createdAt} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
