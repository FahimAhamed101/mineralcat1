"use client";
import { use, useEffect, useState, useRef, useCallback } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentSkill,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import MicRecorder from "mic-recorder-to-mp3";

const RECORD_SECONDS = 35;

// ─── Score Gauge ────────────────────────────────────────────────────────────
function ScoreGauge({ value, max = 100, label, color = "#810000" }) {
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
    </div>
  );
}

// ─── Word Pill ───────────────────────────────────────────────────────────────
function WordPill({ count, label, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 ${color}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

// ─── Result Modal ────────────────────────────────────────────────────────────
function ResultModal({ isOpen, onClose, result }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const assessment  = getQuestionAssessment(result, "read_aloud");
  const speakingScore   = getAssessmentSkill(assessment, "speaking")?.score ?? 0;
  const readingScore    = getAssessmentSkill(assessment, "reading")?.score ?? 0;
  const contentScore    = getAssessmentTrait(assessment, "content")?.score ?? 0;
  const fluencyScore    = getAssessmentTrait(assessment, "fluency")?.score ?? 0;
  const pronunciationScore = getAssessmentTrait(assessment, "pronunciation")?.score ?? 0;
  const totalWords      = getAssessmentMeta(assessment, "totalWords", 0);
  const goodWords       = getAssessmentMeta(assessment, "goodWords", 0);
  const averageWords    = getAssessmentMeta(assessment, "averageWords", 0);
  const badWords        = getAssessmentMeta(assessment, "badWords", 0);

  const overallScore = Math.round((speakingScore + readingScore) / 2);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7D0000] to-[#c0392b] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Read Aloud — AI Score</h2>
            <p className="text-white/75 text-sm mt-0.5">Powered by speech assessment AI</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
          >✕</button>
        </div>

        <div className="p-6 space-y-6">
          {result.success ? (
            <>
              {/* Overall banner */}
              <div className="bg-[#fff5f5] border border-[#f5c6c6] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Overall Score</p>
                  <p className="text-5xl font-black text-[#810000] leading-none">{overallScore}<span className="text-xl font-semibold text-gray-400">/100</span></p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    overallScore >= 70 ? "bg-green-100 text-green-700" :
                    overallScore >= 45 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {overallScore >= 70 ? "Excellent ✓" : overallScore >= 45 ? "Good 👍" : "Needs Practice"}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{totalWords} words detected</p>
                </div>
              </div>

              {/* Skill gauges */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Communicative Skills</p>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                    <ScoreGauge value={speakingScore} label="Speaking" color="#810000" />
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                    <ScoreGauge value={readingScore} label="Reading" color="#c0392b" />
                  </div>
                </div>
              </div>

              {/* Enabling skills */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Enabling Skills</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-blue-700">{Math.round(contentScore)}<span className="text-sm font-medium">%</span></p>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">Content</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-purple-700">{Math.round(fluencyScore)}<span className="text-sm font-medium">%</span></p>
                    <p className="text-xs font-semibold text-purple-600 mt-0.5">Fluency</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-700">{Math.round(pronunciationScore)}<span className="text-sm font-medium">%</span></p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">Pronunciation</p>
                  </div>
                </div>
              </div>

              {/* Word quality */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Word Quality Analysis</p>
                <div className="grid grid-cols-3 gap-3">
                  <WordPill count={goodWords}    label="Good"    color="border-green-300 bg-green-50 text-green-700" />
                  <WordPill count={averageWords} label="Average" color="border-yellow-300 bg-yellow-50 text-yellow-700" />
                  <WordPill count={badWords}     label="Poor"    color="border-red-300 bg-red-50 text-red-700" />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-[#fffbea] border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-bold mb-1">💡 Tips to improve</p>
                {pronunciationScore < 60 && <p>• Work on pronunciation accuracy with native audio models.</p>}
                {fluencyScore < 60 && <p>• Practice reading aloud daily to build natural rhythm and pace.</p>}
                {contentScore < 60 && <p>• Ensure all words are clearly spoken — avoid skipping words.</p>}
                {speakingScore >= 70 && readingScore >= 70 && <p>• Great performance! Keep practising to maintain consistency.</p>}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">😕</div>
              <p className="text-red-600 font-semibold text-lg">Assessment failed</p>
              <p className="text-gray-500 text-sm mt-2">Could not process your recording. Please try again with a clearer microphone.</p>
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

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ReadAloudPage({ params }) {
  const { id } = use(params);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  const recorderRef = useRef(null);
  const timerRef    = useRef(null);

  const [question,       setQuestion]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [timeLeft,       setTimeLeft]       = useState(RECORD_SECONDS);
  const [isRecording,    setIsRecording]    = useState(false);
  const [audioBlob,      setAudioBlob]      = useState(null);
  const [mp3URL,         setMp3URL]         = useState(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState("");

  // Fetch question
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question ?? null);
      } catch {
        setQuestion(null);
      }
      setLoading(false);
      reset();
    }
    load();
    // eslint-disable-next-line
  }, [id]);

  // Countdown while recording
  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) { stopRecording(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  const reset = useCallback(() => {
    setTimeLeft(RECORD_SECONDS);
    setIsRecording(false);
    setAudioBlob(null);
    setMp3URL(null);
    setError("");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      recorderRef.current = new MicRecorder({ bitRate: 128 });
      await recorderRef.current.start();
      setAudioBlob(null);
      setMp3URL(null);
      setTimeLeft(RECORD_SECONDS);
      setIsRecording(true);
      setError("");
    } catch {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.stop().getMp3()
      .then(([, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
      })
      .catch(() => {
        setIsRecording(false);
        setError("Failed to stop recording. Please try again.");
      });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!audioBlob || !question || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("voice",      audioBlob,    "voice.mp3");
    formData.append("questionId", question._id);

    try {
      const res = await fetchWithAuth(`${baseUrl}/test/speaking/read_aloud/result`, {
        method: "POST",
        body:   formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setShowModal(true);
    } catch (e) {
      setError(e.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [audioBlob, question, isSubmitting, baseUrl]);

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
  const elapsed  = RECORD_SECONDS - timeLeft;
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-4 relative">
      <ResultModal isOpen={showModal} onClose={() => setShowModal(false)} result={result} />

      {/* Title */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-5">
        Read Aloud
      </div>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        Look at the text below. In {RECORD_SECONDS} seconds, you must read this text aloud as
        naturally and clearly as possible. You have {RECORD_SECONDS} seconds to read aloud.
      </p>

      {/* Question heading */}
      <div className="flex items-center gap-3 mb-4">
        <span className="rounded-lg px-4 py-2 font-bold text-white bg-[#810000] text-sm tracking-wide">
          #{question._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">{question.heading}</span>
      </div>

      {/* Timer row */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`font-medium text-base ${isRecording ? "text-red-600" : "text-[#810000]"}`}>
          {isRecording ? "Recording:" : "Beginning in"}
          <span className="font-bold ml-1">{timeLeft} sec</span>
        </span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
            REC
          </span>
        )}
      </div>

      {/* Prompt text */}
      <div className="border border-[#810000] rounded-lg bg-white p-5 mb-5 text-gray-800 leading-relaxed text-base">
        {question.prompt}
      </div>

      {/* Recorder panel */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-5">
        {/* Progress bar */}
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

        {/* Status label */}
        <p className="text-center text-sm font-medium text-gray-500 mb-4">
          {isRecording
            ? "🎙 Recording… Speak clearly"
            : audioBlob
            ? "✅ Recording captured — press Submit to score"
            : "Press Start to begin recording"}
        </p>

        {/* Audio preview */}
        {mp3URL && (
          <div className="mb-4 flex justify-center">
            <audio controls src={mp3URL} className="w-full max-w-sm rounded" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Controls */}
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
                Scoring…
              </>
            ) : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}