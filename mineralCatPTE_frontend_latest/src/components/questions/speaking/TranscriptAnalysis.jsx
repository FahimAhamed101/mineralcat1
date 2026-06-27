"use client";

function normalizeTranscriptWords(transcriptWords = []) {
  if (!Array.isArray(transcriptWords) || !transcriptWords.length) return [];

  return transcriptWords
    .map((word, index) => ({
      index,
      text: String(word?.text || word?.word || word?.token || word?.display || "").trim(),
      level: word?.level || "poor",
    }))
    .filter((word) => word.text);
}

function buildFallbackTranscriptWords(transcript = "", goodWords = 0, averageWords = 0, badWords = 0) {
  const tokens = String(transcript)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const normalizedGoodWords = Math.max(0, Number(goodWords) || 0);
  const normalizedAverageWords = Math.max(0, Number(averageWords) || 0);
  const normalizedPoorWords = Math.max(0, Number(badWords) || 0);

  return tokens.map((text, index) => {
    let level = "poor";

    if (index < normalizedGoodWords) {
      level = "good";
    } else if (index < normalizedGoodWords + normalizedAverageWords) {
      level = "average";
    } else if (index < normalizedGoodWords + normalizedAverageWords + normalizedPoorWords) {
      level = "poor";
    }

    return { index, text, level };
  });
}

function getTranscriptWords({
  transcript = "",
  transcriptWords = [],
  goodWords = 0,
  averageWords = 0,
  badWords = 0,
}) {
  const normalizedTranscriptWords = normalizeTranscriptWords(transcriptWords);

  if (normalizedTranscriptWords.length) {
    return normalizedTranscriptWords;
  }

  return buildFallbackTranscriptWords(transcript, goodWords, averageWords, badWords);
}

function getTextColor(level) {
  if (level === "good") return "text-green-600";
  if (level === "average") return "text-amber-500";
  return "text-red-500";
}

export default function TranscriptAnalysis({
  transcript = "",
  transcriptWords = [],
  goodWords = 0,
  averageWords = 0,
  badWords = 0,
  title = "Transcript Analysis",
}) {
  const words = getTranscriptWords({
    transcript,
    transcriptWords,
    goodWords,
    averageWords,
    badWords,
  });

  if (!words.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</p>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="text-green-600">Good</span>
          <span className="text-amber-500">Average</span>
          <span className="text-red-500">Poor</span>
        </div>
      </div>
      <div className="rounded-xl border border-[#d7ece0] bg-[#fbfffc] p-4 text-[15px] leading-8">
        {words.map((word) => (
          <span key={`${word.index}-${word.text}`} className={`${getTextColor(word.level)} font-medium`}>
            {word.text}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
