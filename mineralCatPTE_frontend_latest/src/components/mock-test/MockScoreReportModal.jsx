"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import useLoggedInUser from "@/lib/useGetLoggedInUser";

const SECTION_STYLES = [
  {
    key: "listening",
    label: "Listening",
    ring: "border-[#1F4C8F]",
    fill: "bg-[#1F4C8F]",
    soft: "bg-[#EAF2FF]",
    text: "text-[#1F4C8F]",
    border: "border-[#CFE0F5]",
  },
  {
    key: "reading",
    label: "Reading",
    ring: "border-[#C7C900]",
    fill: "bg-[#C7C900]",
    soft: "bg-[#FBFAD9]",
    text: "text-[#707300]",
    border: "border-[#E7E9B4]",
  },
  {
    key: "speaking",
    label: "Speaking",
    ring: "border-[#6C6A6A]",
    fill: "bg-[#6C6A6A]",
    soft: "bg-[#F2F0EF]",
    text: "text-[#4E4C4C]",
    border: "border-[#DDD8D4]",
  },
  {
    key: "writing",
    label: "Writing",
    ring: "border-[#B2178E]",
    fill: "bg-[#B2178E]",
    soft: "bg-[#FBE6F5]",
    text: "text-[#8A126E]",
    border: "border-[#EBC8E0]",
  },
];

const SECTION_STYLE_MAP = Object.fromEntries(
  SECTION_STYLES.map((section) => [section.key, section])
);

const DETAIL_SECTION_ORDER = ["speaking", "writing", "reading", "listening"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRoundedScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : null;
}

function getDerivedSectionScore(section) {
  const directScore = getRoundedScore(section?.score);
  if (directScore !== null) {
    return directScore;
  }

  const taskScores = Array.isArray(section?.tasks)
    ? section.tasks
        .map((task) => getRoundedScore(task?.score))
        .filter((score) => Number.isFinite(score))
    : [];

  if (!taskScores.length) {
    return null;
  }

  const total = taskScores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / taskScores.length);
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "C";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "Not available";

  const parsedValue = new Date(value);
  if (Number.isNaN(parsedValue.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedValue);
}

function formatDuration(duration) {
  if (duration === null || duration === undefined || duration === "") {
    return "Not available";
  }

  if (
    typeof duration === "string" &&
    duration.replace(/\s+/g, " ").trim().includes("[object Object]")
  ) {
    return "Not available";
  }

  const toFiniteNumber = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : null;
    }

    if (typeof value === "object") {
      if (Number.isFinite(Number(value.$numberInt))) {
        return Number(value.$numberInt);
      }
      if (Number.isFinite(Number(value.$numberDouble))) {
        return Number(value.$numberDouble);
      }
    }

    return null;
  };

  const resolveDurationObject = (value) => {
    if (!value || typeof value !== "object") return null;

    const visited = new Set();
    const queue = [value];

    while (queue.length) {
      const candidate = queue.shift();
      if (!candidate || typeof candidate !== "object" || visited.has(candidate)) {
        continue;
      }
      visited.add(candidate);

      const hoursValue =
        toFiniteNumber(candidate.hours) ??
        toFiniteNumber(candidate.hour) ??
        toFiniteNumber(candidate.hrs);
      const minutesValue =
        toFiniteNumber(candidate.minutes) ??
        toFiniteNumber(candidate.minute) ??
        toFiniteNumber(candidate.mins);
      const totalMinutesValue =
        toFiniteNumber(candidate.totalMinutes) ??
        toFiniteNumber(candidate.durationMinutes);

      if (totalMinutesValue !== null) {
        return { totalMinutes: Math.max(0, Math.round(totalMinutesValue)) };
      }

      if (hoursValue !== null || minutesValue !== null) {
        const safeHours = Math.max(0, Math.round(hoursValue ?? 0));
        const safeMinutes = Math.max(0, Math.round(minutesValue ?? 0));
        return { totalMinutes: safeHours * 60 + safeMinutes };
      }

      Object.values(candidate).forEach((childValue) => {
        if (childValue && typeof childValue === "object") {
          queue.push(childValue);
        }
      });
    }

    return null;
  };

  if (typeof duration === "object") {
    const resolvedObjectDuration = resolveDurationObject(duration);
    if (resolvedObjectDuration) {
      const totalMinutes = resolvedObjectDuration.totalMinutes;
      const normalizedHours = Math.floor(totalMinutes / 60);
      const normalizedMinutes = totalMinutes % 60;

      if (normalizedHours && normalizedMinutes) return `${normalizedHours}h ${normalizedMinutes}m`;
      if (normalizedHours) return `${normalizedHours}h`;
      return `${normalizedMinutes} min`;
    }
  }

  const numericDuration = Number(duration);
  if (!Number.isFinite(numericDuration)) {
    return "Not available";
  }

  const totalMinutes = Math.max(0, Math.round(numericDuration));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes} min`;
}

function getBarWidth(score) {
  const roundedScore = getRoundedScore(score);
  if (roundedScore === null) return 0;
  return clamp(((roundedScore - 10) / 80) * 100, 0, 100);
}

function getMarkerPosition(score) {
  const roundedScore = getRoundedScore(score);
  if (roundedScore === null) return 0;
  return clamp(((roundedScore - 10) / 80) * 100, 0, 100);
}

function getSectionStyle(sectionKey) {
  return (
    SECTION_STYLE_MAP[sectionKey] || {
      key: sectionKey,
      label: sectionKey,
      ring: "border-[#CFC8BD]",
      fill: "bg-[#8A847B]",
      soft: "bg-[#F3F0EA]",
      text: "text-[#5E564C]",
      border: "border-[#E2DBD0]",
    }
  );
}

function formatSectionType(sectionType) {
  if (!sectionType) return "";
  const normalizedValue = String(sectionType).trim();
  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
}

function getTaskCountLabel(taskCount) {
  return taskCount === 1 ? "1 task" : `${taskCount} tasks`;
}

function ScoreCircle({ label, score, style }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-[4px] ${style.ring} bg-white text-[30px] font-semibold leading-none text-[#2A231C]`}
      >
        {score ?? "--"}
      </div>
      <p className={`text-sm font-medium ${style.text}`}>{label}</p>
    </div>
  );
}

function SkillBreakdownRow({ label, score, style, overallScore }) {
  const width = getBarWidth(score);
  const markerPosition = getMarkerPosition(overallScore);

  return (
    <div className="grid grid-cols-[88px_34px_minmax(0,1fr)] items-center gap-3">
      <span className="text-xs text-[#746A5F]">{label}</span>
      <span className={`text-right text-xs font-semibold ${style.text}`}>
        {score ?? "--"}
      </span>

      <div className="relative h-6 overflow-hidden rounded-sm border border-[#E7DED0] bg-white">
        <div
          className={`absolute inset-y-0 left-0 ${style.fill}`}
          style={{ width: `${width}%` }}
        />

        {overallScore !== null ? (
          <>
            <div
              className="absolute inset-y-0 w-[2px] bg-[#49505A]"
              style={{ left: `calc(${markerPosition}% - 1px)` }}
            />
            <div
              className="absolute -top-5 -translate-x-1/2 text-[11px] font-medium text-[#597091]"
              style={{ left: `${markerPosition}%` }}
            >
              Overall {overallScore}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function OverallScoreBadge({ score }) {
  return (
    <div className="mx-auto w-[128px] overflow-hidden rounded-[16px] border border-[#C8D7DB] bg-white text-center shadow-sm">
      <div className="bg-[#0A7F95] px-3 py-2 text-xs font-semibold text-white">
        Overall Score
      </div>
      <div className="bg-[#B0188D] px-3 py-4 text-[52px] font-semibold leading-none text-white">
        {score ?? "--"}
      </div>
    </div>
  );
}

function TaskRow({ task, style }) {
  const taskScore = getRoundedScore(task.score);
  const rawScore = Number.isFinite(Number(task.rawScore))
    ? Number(task.rawScore)
    : null;
  const maxScore = Number.isFinite(Number(task.maxScore))
    ? Number(task.maxScore)
    : null;
  const communicativeSkills = Array.isArray(task.communicativeSkills)
    ? task.communicativeSkills
    : [];

  return (
    <div className={`rounded-[20px] border ${style.border} bg-white px-4 py-4 shadow-sm`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {task.reference ? (
              <span
                className={`rounded-full border ${style.ring} ${style.soft} px-2.5 py-1 text-xs font-semibold ${style.text}`}
              >
                {task.reference}
              </span>
            ) : null}

            <span className="rounded-full border border-[#E8E0D2] bg-[#FFF8EA] px-2.5 py-1 text-xs font-medium text-[#6B5C43]">
              {task.subtypeLabel || "Task"}
            </span>
          </div>

          <h4 className="mt-3 text-base font-semibold text-[#211B14]">
            {task.title || task.subtypeLabel || "Untitled Task"}
          </h4>

          {communicativeSkills.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {communicativeSkills.map((skill) => (
                <span
                  key={`${task.questionId}-${skill.key}`}
                  className={`rounded-full ${style.soft} px-2.5 py-1 text-xs font-medium ${style.text}`}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
          <div
            className={`min-w-[112px] rounded-[18px] border ${style.ring} ${style.soft} px-4 py-3 text-center`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B6D58]">
              Task Score
            </p>
            <p className={`mt-1 text-2xl font-semibold ${style.text}`}>
              {taskScore ?? "--"}
            </p>
          </div>

          {rawScore !== null && maxScore !== null ? (
            <p className="text-xs text-[#6D6255]">Raw {rawScore}/{maxScore}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function MockScoreReportModal({
  isOpen,
  onClose,
  result,
  testName,
  testMode,
  testId,
  testDuration,
  questionCount,
  sectionType,
}) {
  const { user } = useLoggedInUser();
  const [activeSectionKey, setActiveSectionKey] = useState(null);

  const resultData = result?.data || {};
  const candidate = user?.user || {};
  const displayName = candidate.name || "Candidate";
  const candidateId = candidate._id
    ? String(candidate._id).slice(-8).toUpperCase()
    : "N/A";
  const reportType = sectionType
    ? `${testMode || "Mock Test"} / ${formatSectionType(sectionType)}`
    : testMode || "Mock Test";
  const resolvedDurationLabel = formatDuration(testDuration ?? resultData.duration);
  const completedTaskCount = Number.isFinite(Number(resultData.completedTaskCount))
    ? Number(resultData.completedTaskCount)
    : 0;

  const sections = Array.isArray(resultData.sections)
    ? resultData.sections.map((section) => ({
        ...section,
        style: getSectionStyle(section.key),
        score: getDerivedSectionScore(section),
        taskCount: Number.isFinite(Number(section.taskCount))
          ? Number(section.taskCount)
          : Array.isArray(section.tasks)
            ? section.tasks.length
            : 0,
        tasks: Array.isArray(section.tasks) ? section.tasks : [],
      }))
    : [];

  const sectionScoreMap = Object.fromEntries(
    sections.map((section) => [section.key, section.score])
  );

  const sectionScores = SECTION_STYLES.map((section) => ({
    ...section,
    score:
      getRoundedScore(resultData[section.key]) ??
      getRoundedScore(sectionScoreMap[section.key]),
  }));

  const overallScoreParts = sectionScores
    .map((section) => section.score)
    .filter((score) => Number.isFinite(score));
  const overallScore = overallScoreParts.length
    ? overallScoreParts.reduce((sum, score) => sum + score, 0)
    : getRoundedScore(resultData.totalScore);

  const populatedSections = DETAIL_SECTION_ORDER.map((sectionKey) =>
    sections.find((section) => section.key === sectionKey)
  ).filter((section) => section && section.taskCount > 0);

  const defaultActiveSectionKey = populatedSections[0]?.key || null;

  useEffect(() => {
    setActiveSectionKey(defaultActiveSectionKey);
  }, [defaultActiveSectionKey, isOpen]);

  const activeSection =
    populatedSections.find((section) => section.key === activeSectionKey) ||
    populatedSections[0] ||
    null;
  const activeSectionStyle = activeSection
    ? getSectionStyle(activeSection.key)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-3 sm:p-6">
      <div className="mx-auto max-w-[1080px] py-3 sm:py-6">
        <div className="overflow-hidden rounded-[26px] bg-[#F8F6F0] shadow-[0_24px_80px_rgba(39,29,14,0.28)]">
          <div className="flex items-center justify-between border-b border-[#E4DAC7] bg-white px-5 py-4 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A57A1E]">
                PTE Core Mock Score Report
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#2A241D]">Reported Scores</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E6DECF] bg-white p-2 text-[#5A2A00] transition hover:bg-[#FAF7F1]"
              aria-label="Close score report"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-4 sm:p-7">
            <section className="rounded-[24px] border border-[#D9DED9] border-t-[4px] border-t-[#E7AA24] bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-start">
                  <div className="flex min-w-0 items-start gap-4">
                    {candidate.profile ? (
                      <img
                        src={candidate.profile}
                        alt={displayName}
                        className="h-24 w-24 rounded-[6px] object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-[6px] bg-[#E9E0D2] text-3xl font-semibold text-[#7A4A00]">
                        {getInitials(displayName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-[30px] font-medium leading-tight text-[#2A241D]">
                        {displayName}
                      </h3>
                      <div className="mt-3 space-y-1 text-sm font-medium text-[#3A3128]">
                        <p>Test Name: {testName || "Mock Test"}</p>
                        <p>Test Date: {formatDate(resultData.testDate)}</p>
                        <p>Test Type: {reportType}</p>
                        <p>Candidate ID: {candidateId}</p>
                        <p>
                          Duration: {resolvedDurationLabel}
                          {questionCount ? ` | Questions: ${completedTaskCount}/${questionCount}` : ""}
                        </p>
                        <p>Test ID: {testId ? String(testId).slice(-10).toUpperCase() : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:justify-self-end">
                    <OverallScoreBadge score={overallScore} />
                  </div>
                </div>

                <div className="mt-6 border-t border-[#EAE3D8] pt-5">
                  <h4 className="text-[18px] font-semibold text-[#3A3128]">Communicative Skills</h4>

                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {sectionScores.map((section) => (
                      <ScoreCircle
                        key={section.key}
                        label={section.label}
                        score={section.score}
                        style={section}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-6 border-t border-[#EAE3D8] pt-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <h4 className="text-[18px] font-semibold text-[#3A3128]">Skills Breakdown</h4>

                    <div className="mt-5 space-y-3">
                      {sectionScores.map((section) => (
                        <SkillBreakdownRow
                          key={section.key}
                          label={section.label}
                          score={section.score}
                          style={section}
                          overallScore={overallScore}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[18px] font-semibold text-[#3A3128]">Further Information</h4>
                    <p className="mt-4 text-sm leading-6 text-[#6B6155]">
                      This mock score report follows the official PTE score report structure more
                      closely, while keeping the detailed task-by-task breakdown needed for mock
                      review.
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#6B6155]">
                      Mock scores stay within the PTE range of 10 to 90, and every completed task
                      appears under its section below.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#E8E0CB] bg-white shadow-sm">
              <div className="border-b border-[#EEE5D5] px-5 py-5 sm:px-6">
                <h3 className="text-xl font-semibold text-[#221B14]">Detailed Task Breakdown</h3>
                <p className="mt-1 text-sm text-[#665A4C]">
                  Each section is separated clearly and every scored task is shown under it.
                </p>
              </div>

              {populatedSections.length ? (
                <div className="space-y-5 p-4 sm:p-6">
                  <div className="flex flex-wrap gap-6 border-b border-[#E9E1D3] px-1 pb-3">
                    {populatedSections.map((section) => {
                      const style = getSectionStyle(section.key);
                      const isActive = section.key === activeSection?.key;

                      return (
                        <button
                          key={section.key}
                          type="button"
                          onClick={() => setActiveSectionKey(section.key)}
                          className={`border-b-2 pb-2 text-base font-semibold transition ${
                            isActive
                              ? `${style.text} ${style.ring}`
                              : "border-transparent text-[#3D352B] hover:text-[#1E1A15]"
                          }`}
                        >
                          {section.label}
                        </button>
                      );
                    })}
                  </div>

                  {activeSection && activeSectionStyle ? (
                    <div className="rounded-[22px] border border-[#D9EEEF] bg-[#F4FBFC] p-4 sm:p-5">
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-[#221B14]">
                            {activeSection.label}
                          </h4>
                          <p className="mt-1 text-sm text-[#665A4C]">
                            {getTaskCountLabel(activeSection.taskCount)} shown below.
                          </p>
                        </div>

                        <div
                          className={`inline-flex items-center rounded-full border ${activeSectionStyle.ring} bg-white px-4 py-2 text-sm font-semibold ${activeSectionStyle.text}`}
                        >
                          Section Score: {activeSection.score ?? "--"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {activeSection.tasks.map((task) => (
                          <TaskRow
                            key={`${activeSection.key}-${task.questionId}-${task.submittedAt || task.reference || task.title}`}
                            task={task}
                            style={activeSectionStyle}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-5 sm:p-6">
                  <div className="rounded-[22px] border border-dashed border-[#D9D0C0] bg-[#FFFDF8] px-5 py-8 text-sm text-[#6B6155]">
                    Task-level rows will appear here after the mock result includes scored
                    question data.
                  </div>
                </div>
              )}
            </section>

            <div className="rounded-[20px] border border-[#E8E0CB] bg-[#FFF9EC] px-5 py-4 text-sm text-[#65594C]">
              This is a practice report. It is designed to match the official score-report layout
              more closely, but it is not an official Pearson PTE score report.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
