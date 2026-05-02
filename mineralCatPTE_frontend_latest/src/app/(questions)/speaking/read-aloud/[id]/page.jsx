"use client";
import { use, useEffect, useState, useRef, useCallback } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentSkill,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import { loadQuestionScoreHistory } from "@/lib/questionScoreHistory";

const RECORD_SECONDS = 35;
const DISPLAY_SCORE_MAX = 90;
const GOOD_WORD_MIN = 90;
const AVERAGE_WORD_MIN = 60;
const MIN_RECORDING_DURATION_SECONDS = 2;

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "";
}

function getAudioUploadFileName(blob) {
  const mimeType = String(blob?.type || "").toLowerCase();

  if (mimeType.includes("webm")) return "voice.webm";
  if (mimeType.includes("ogg")) return "voice.ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "voice.m4a";
  if (mimeType.includes("wav")) return "voice.wav";

  return "voice.mp3";
}

function ScoreGauge({ value, max = DISPLAY_SCORE_MAX, label, color = "#810000", footer = "" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3e8e8" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
          {Math.round(value)}
        </text>
      </svg>
      <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{label}</span>
      {footer ? <span className="text-[11px] font-medium text-gray-400">{footer}</span> : null}
    </div>
  );
}

function WordPill({ count, label, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 ${color}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

function toDisplayOutOf90(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0;
  return Math.round((numericValue / 100) * DISPLAY_SCORE_MAX);
}

function getTranscriptWordLevel(score) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return "poor";
  if (numericScore >= GOOD_WORD_MIN) return "good";
  if (numericScore >= AVERAGE_WORD_MIN) return "average";
  return "poor";
}

function normalizeTranscriptWords(transcriptWords = [], transcript = "") {
  if (Array.isArray(transcriptWords) && transcriptWords.length) {
    return transcriptWords
      .map((word, index) => ({
        index,
        text: String(word?.text || "").trim(),
        level: word?.level || getTranscriptWordLevel(word?.score),
      }))
      .filter((word) => word.text);
  }

  return String(transcript)
    .split(/\s+/)
    .map((text, index) => ({ index, text: text.trim(), level: "poor" }))
    .filter((word) => word.text);
}

function getFriendlySpeechErrorMessage(message) {
  const normalizedMessage = String(message || "");

  if (
    normalizedMessage.includes("error_no_speech") ||
    normalizedMessage.toLowerCase().includes("no speech was detected") ||
    normalizedMessage.toLowerCase().includes("no speech is detected")
  ) {
    return "No speech was detected in your recording. Please speak clearly for at least a couple of seconds, then submit again.";
  }

  return normalizedMessage || "Submission failed. Please try again.";
}

function PreviousScoreCard({ item }) {
  return (
    <div className="rounded-2xl border border-[#bdeff3] bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7a57c7] text-lg font-bold text-white">
            Y
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{item.timeLabel}</p>
            <p className="text-xs text-gray-400">Previous AI score</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#7be4ec] px-4 py-2 text-[#4fcad3]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7be4ec] bg-white text-sm font-bold">
              S
            </span>
            <span className="text-lg font-bold">{item.speaking}/90</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#7be4ec] px-4 py-2 text-[#4fcad3]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7be4ec] bg-white text-sm font-bold">
              R
            </span>
            <span className="text-lg font-bold">{item.reading}/90</span>
          </div>
          <div className="inline-flex items-center rounded-full bg-[#f5a267] px-4 py-2 text-sm font-semibold text-white">
            AI Score
          </div>
        </div>
      </div>
    </div>
  );
}

function buildReadAloudPreviousScores(questionId) {
  return loadQuestionScoreHistory(questionId, "read_aloud").map((entry) => {
    const assessment = entry?.assessment || {};
    const speakingScore = Number(
      (Array.isArray(assessment.skills) ? assessment.skills : []).find(
        (metric) => metric?.key === "speaking"
      )?.score ?? 0
    );
    const readingScore = Number(
      (Array.isArray(assessment.skills) ? assessment.skills : []).find(
        (metric) => metric?.key === "reading"
      )?.score ?? 0
    );

    return {
      id: entry?.id || entry?.createdAt || `${questionId}-${Math.random()}`,
      speaking: toDisplayOutOf90(speakingScore),
      reading: toDisplayOutOf90(readingScore),
      timeLabel: entry?.timeLabel || "-",
    };
  });
}

function ResultModal({ isOpen, onClose, result }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const assessment = getQuestionAssessment(result, "read_aloud");
  const speakingScore = getAssessmentSkill(assessment, "speaking")?.score ?? 0;
  const readingScore = getAssessmentSkill(assessment, "reading")?.score ?? 0;
  const contentScore = getAssessmentTrait(assessment, "content")?.score ?? 0;
  const fluencyScore = getAssessmentTrait(assessment, "fluency")?.score ?? 0;
  const pronunciationScore = getAssessmentTrait(assessment, "pronunciation")?.score ?? 0;
  const totalWords = getAssessmentMeta(assessment, "totalWords", 0);
  const goodWords = getAssessmentMeta(assessment, "goodWords", 0);
  const averageWords = getAssessmentMeta(assessment, "averageWords", 0);
  const badWords = getAssessmentMeta(assessment, "badWords", 0);
  const transcript = getAssessmentMeta(assessment, "transcript", "");
  const noSpeechDetected = getAssessmentMeta(assessment, "noSpeechDetected", false);
  const transcriptWords = normalizeTranscriptWords(
    getAssessmentMeta(assessment, "transcriptWords", []),
    transcript
  );
  const contentIsZero = Number(contentScore) === 0;
  const speakingDisplayScore = toDisplayOutOf90(speakingScore);
  const readingDisplayScore = toDisplayOutOf90(readingScore);
  const contentDisplayScore = toDisplayOutOf90(contentScore);
  const fluencyDisplayScore = toDisplayOutOf90(fluencyScore);
  const pronunciationDisplayScore = toDisplayOutOf90(pronunciationScore);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="bg-gradient-to-r from-[#7D0000] to-[#c0392b] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Read Aloud - AI Score</h2>
            <p className="text-white/75 text-sm mt-0.5">Powered by speech assessment AI</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
          >
            x
          </button>
        </div>

        <div className="p-6 space-y-6">
          {result.success ? (
            <>
              <div className="flex items-center justify-end">
                <p className="text-xs text-gray-400 font-medium">{totalWords} words detected</p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f5c6c6] bg-[#fff5f5] px-4 py-3">
                <p className="text-sm font-bold text-[#810000]">AI Score</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  speakingScore >= 70 && readingScore >= 70
                    ? "bg-green-100 text-green-700"
                    : speakingScore >= 45 || readingScore >= 45
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}>
                  {speakingScore >= 70 && readingScore >= 70
                    ? "Excellent"
                    : speakingScore >= 45 || readingScore >= 45
                      ? "Good"
                      : "Needs Practice"}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Communicative Skills</p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                    <ScoreGauge
                      value={speakingDisplayScore}
                      label="Speaking"
                      color="#810000"
                      footer="Out of 90"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                    <ScoreGauge
                      value={readingDisplayScore}
                      label="Reading"
                      color="#c0392b"
                      footer="Out of 90"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Enabling Skills</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-blue-700">
                      {contentDisplayScore}
                      <span className="text-sm font-medium">/90</span>
                    </p>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">Content</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-purple-700">
                      {fluencyDisplayScore}
                      <span className="text-sm font-medium">/90</span>
                    </p>
                    <p className="text-xs font-semibold text-purple-600 mt-0.5">Fluency</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-700">
                      {pronunciationDisplayScore}
                      <span className="text-sm font-medium">/90</span>
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">Pronunciation</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Word Quality Analysis</p>
                <div className="grid grid-cols-3 gap-3">
                  <WordPill count={goodWords} label="Good" color="border-green-300 bg-green-50 text-green-700" />
                  <WordPill count={averageWords} label="Average" color="border-yellow-300 bg-yellow-50 text-yellow-700" />
                  <WordPill count={badWords} label="Poor" color="border-red-300 bg-red-50 text-red-700" />
                </div>
              </div>

              {transcriptWords.length ? (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Transcript Analysis</p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="text-green-600">Good</span>
                      <span className="text-amber-500">Average</span>
                      <span className="text-red-500">Poor</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#d7ece0] bg-[#fbfffc] p-4 text-[15px] leading-8">
                    {transcriptWords.map((word) => {
                      const textColor =
                        word.level === "good"
                          ? "text-green-600"
                          : word.level === "average"
                            ? "text-amber-500"
                            : "text-red-500";

                      return (
                        <span key={`${word.index}-${word.text}`} className={`${textColor} font-medium`}>
                          {word.text}{" "}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="bg-[#fffbea] border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-bold mb-1">Tips to improve</p>
                {noSpeechDetected ? (
                  <p>
                    No speech was detected in your recording. This attempt is scored as 0 for speaking, reading, content, fluency, and pronunciation.
                  </p>
                ) : contentIsZero ? (
                  <p>
                    No correct words matched the prompt. Your content score is 0. By official PTE
                    scoring rules, this response receives no score points, so all scores are 0.
                  </p>
                ) : (
                  <>
                    {pronunciationScore < 60 && <p>- Work on pronunciation accuracy with native audio models.</p>}
                    {fluencyScore < 60 && <p>- Practice reading aloud daily to build natural rhythm and pace.</p>}
                    {contentScore < 60 && <p>- Ensure all words are clearly spoken and avoid skipping words.</p>}
                    {speakingScore >= 70 && readingScore >= 70 && (
                      <p>- Great performance! Keep practising to maintain consistency.</p>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">!</div>
              <p className="text-red-600 font-semibold text-lg">Assessment failed</p>
              <p className="text-gray-500 text-sm mt-2">
                Could not process your recording. Please try again with a clearer microphone.
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#810000] hover:bg-[#6a0000] text-white rounded-xl font-semibold transition"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReadAloudPage({ params }) {
  const { id } = use(params);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const timeLeftRef = useRef(RECORD_SECONDS);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const [previousScores, setPreviousScores] = useState([]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const reset = useCallback(() => {
    setTimeLeft(RECORD_SECONDS);
    setIsRecording(false);
    setAudioBlob(null);
    setMp3URL(null);
    setError("");
    setRecordingDurationSeconds(0);
    timeLeftRef.current = RECORD_SECONDS;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        const nextQuestion = data?.question ?? null;
        setQuestion(nextQuestion);
        setPreviousScores(
          nextQuestion?._id ? buildReadAloudPreviousScores(nextQuestion._id) : []
        );
      } catch {
        setQuestion(null);
        setPreviousScores([]);
      }
      setLoading(false);
      reset();
    }
    load();
  }, [baseUrl, id, reset]);

  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) {
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      streamRef.current = stream;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setAudioBlob(null);
      setMp3URL(null);
      setTimeLeft(RECORD_SECONDS);
      setIsRecording(true);
      setError("");
      setRecordingDurationSeconds(0);
      timeLeftRef.current = RECORD_SECONDS;
    } catch {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    const recorder = recorderRef.current;

    recorder.onstop = () => {
      const fallbackMimeType = getSupportedRecordingMimeType() || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || fallbackMimeType });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setAudioBlob(blob);
      setMp3URL(URL.createObjectURL(blob));
      setIsRecording(false);
      setRecordingDurationSeconds(RECORD_SECONDS - timeLeftRef.current);
    };

    try {
      recorder.stop();
    } catch {
      setIsRecording(false);
      setError("Failed to stop recording. Please try again.");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!audioBlob || !question || isSubmitting) return;

    if (
      recordingDurationSeconds < MIN_RECORDING_DURATION_SECONDS ||
      audioBlob.size <= 0
    ) {
      setError("Your recording is too short to score reliably. Please record yourself speaking clearly for at least 2 seconds.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("voice", audioBlob, getAudioUploadFileName(audioBlob));
    formData.append("questionId", question._id);

    try {
      const res = await fetchWithAuth(`${baseUrl}/test/speaking/read_aloud/result`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setPreviousScores(buildReadAloudPreviousScores(question._id));
      setShowModal(true);
    } catch (e) {
      setError(getFriendlySpeechErrorMessage(e.message));
    } finally {
      setIsSubmitting(false);
    }
  }, [audioBlob, question, isSubmitting, baseUrl, recordingDurationSeconds, timeLeft]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#810000]" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-500">
        Question not found.
      </div>
    );
  }

  const progress = ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100;
  const elapsed = RECORD_SECONDS - timeLeft;
  const fmt = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-4 relative">
      <ResultModal isOpen={showModal} onClose={() => setShowModal(false)} result={result} />

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-5">
        Read Aloud
      </div>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Look at the text below. In {RECORD_SECONDS} seconds, you must read this text aloud as
        naturally and clearly as possible. You have {RECORD_SECONDS} seconds to read aloud.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <span className="rounded-lg px-4 py-2 font-bold text-white bg-[#810000] text-sm tracking-wide">
          #{question._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">{question.heading}</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className={`font-medium text-base ${isRecording ? "text-red-600" : "text-[#810000]"}`}>
          {isRecording ? (
            <>
              Recording:
              <span className="font-bold ml-1">{timeLeft} sec</span>
            </>
          ) : audioBlob ? (
            "Recording finished"
          ) : (
            <>
              Beginning in
              <span className="font-bold ml-1">{timeLeft} sec</span>
            </>
          )}
        </span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
            REC
          </span>
        )}
      </div>

      <div className="border border-[#810000] rounded-lg bg-white p-5 mb-5 text-gray-800 leading-relaxed text-base">
        {question.prompt}
      </div>

      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 w-10 text-right">{fmt(elapsed)}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-[#810000] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10">{fmt(RECORD_SECONDS)}</span>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mb-4">
          {isRecording
            ? "Recording... Speak clearly"
            : audioBlob
              ? "Recording captured - press Submit to score"
              : "Press Start to begin recording"}
        </p>

        {mp3URL && (
          <div className="mb-4 flex justify-center">
            <audio controls src={mp3URL} className="w-full max-w-sm rounded" />
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            disabled={isRecording || isSubmitting}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-40 transition"
          >
            Restart
          </button>

          <button
            onClick={startRecording}
            disabled={isRecording || timeLeft === 0 || isSubmitting}
            className="px-6 py-2 rounded-lg bg-[#810000] text-white font-semibold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition"
          >
            Start
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording || isSubmitting}
            className="px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold text-sm hover:bg-gray-700 disabled:opacity-40 transition"
          >
            Stop
          </button>

          <button
            onClick={handleSubmit}
            disabled={!audioBlob || isSubmitting}
            className="px-7 py-2 rounded-lg bg-[#810000] text-white font-bold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scoring...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>

      {previousScores.length ? (
        <div className="mt-10 rounded-[28px] bg-[#edfdfd] p-5">
          <div className="mb-5 text-center">
            <h2 className="inline-block border-b-2 border-[#f5a267] px-4 pb-2 text-3xl font-semibold text-[#f5a267]">
              My Score
            </h2>
          </div>
          <div className="space-y-4">
            {previousScores.map((item) => (
              <PreviousScoreCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
