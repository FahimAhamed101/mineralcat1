"use client";
import React, { use, useEffect, useRef, useState } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import MicRecorder from "mic-recorder-to-mp3";

const RECORD_SECONDS = 15;
const DISPLAY_SCORE_MAX = 90;

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
          cx="36"
          cy="36"
          r={r}
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

function normalizeContentScore(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0;
  return numericValue <= 1 ? numericValue * 100 : numericValue;
}

function getRepeatSentenceResultData(serverResponse) {
  const assessment = getQuestionAssessment(serverResponse, "repeat_sentence");
  const fluency = getAssessmentTrait(assessment, "fluency")?.score ?? 0;
  const pronunciation = getAssessmentTrait(assessment, "pronunciation")?.score ?? 0;
  const content = getAssessmentTrait(assessment, "content")?.score ?? 0;
  const normalizedContent = normalizeContentScore(content);

  return {
    speakingScore: (Number(fluency) + Number(pronunciation)) / 2,
    listeningScore: normalizedContent,
    fluency,
    content: normalizedContent,
    pronunciation,
    totalWords: getAssessmentMeta(assessment, "totalWords", 0),
    goodWords: getAssessmentMeta(assessment, "goodWords", 0),
    averageWords: getAssessmentMeta(assessment, "averageWords", 0),
    badWords: getAssessmentMeta(assessment, "badWords", 0),
    predictedText: getAssessmentMeta(assessment, "predictedText", ""),
  };
}

function ResultModal({ isOpen, onClose, serverResponse }) {
  const scoreData = getRepeatSentenceResultData(serverResponse);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const speakingDisplayScore = toDisplayOutOf90(scoreData.speakingScore);
  const listeningDisplayScore = toDisplayOutOf90(scoreData.listeningScore);
  const fluencyDisplayScore = toDisplayOutOf90(scoreData.fluency);
  const contentDisplayScore = toDisplayOutOf90(scoreData.content);
  const pronunciationDisplayScore = toDisplayOutOf90(scoreData.pronunciation);

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
            <h2 className="text-white text-xl font-bold">Repeat Sentence - AI Score</h2>
            <p className="text-white/75 text-sm mt-0.5">Same scoring layout as Read Aloud</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
          >
            x
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f5c6c6] bg-[#fff5f5] px-4 py-3">
            <p className="text-sm font-bold text-[#810000]">AI Score</p>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                speakingDisplayScore >= 70 && listeningDisplayScore >= 70
                  ? "bg-green-100 text-green-700"
                  : speakingDisplayScore >= 45 || listeningDisplayScore >= 45
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {speakingDisplayScore >= 70 && listeningDisplayScore >= 70
                ? "Excellent"
                : speakingDisplayScore >= 45 || listeningDisplayScore >= 45
                  ? "Good"
                  : "Needs Practice"}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Communicative Skills</p>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                <ScoreGauge value={speakingDisplayScore} label="Speaking" color="#810000" footer="Out of 90" />
              </div>
              <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                <ScoreGauge value={listeningDisplayScore} label="Listening" color="#c0392b" footer="Out of 90" />
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
              <WordPill count={scoreData.goodWords} label="Good" color="border-green-300 bg-green-50 text-green-700" />
              <WordPill count={scoreData.averageWords} label="Average" color="border-yellow-300 bg-yellow-50 text-yellow-700" />
              <WordPill count={scoreData.badWords} label="Poor" color="border-red-300 bg-red-50 text-red-700" />
            </div>
          </div>

          {scoreData.predictedText ? (
            <div className="rounded-xl border border-[#d7ece0] bg-[#fbfffc] p-4">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Transcript
              </p>
              <p className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">
                {scoreData.predictedText}
              </p>
            </div>
          ) : null}

          <div className="bg-[#fffbea] border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-bold mb-1">Scoring rule used here</p>
            <p>Listening uses the Content score.</p>
            <p>Speaking uses the average of Pronunciation and Fluency.</p>
          </div>

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

export default function RepeatSentencePage({ params }) {
  const { id } = use(params);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const timerRef = useRef();
  const audioRef = useRef();
  const recorder = useRef(null);

  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch {
        setQuestion(null);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setAudioBlob(null);
      setIsRecording(false);
    }

    getQuestion();
  }, [baseUrl, id]);

  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) {
      setIsRecording(false);
      stopRecording();
      return;
    }

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  const handleAudioPlay = () => {};
  const handleAudioEnded = () => {};

  const startRecording = async () => {
    try {
      if (!recorder.current) {
        recorder.current = new MicRecorder({ bitRate: 128 });
      }
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (recorder.current) {
      try {
        const [, blob] = await recorder.current.stop().getMp3();
        setAudioBlob(blob);
        setIsRecording(false);
      } catch {
        setAudioBlob(null);
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || !question) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/speaking/repeat_sentence/result`,
        {
          method: "POST",
          body: formData,
        }
      );
      setServerResponse(await response.json());
      setIsModalOpen(true);
    } catch (e) {
      console.error("Submission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  const progress = ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100;
  const elapsed = RECORD_SECONDS - timeLeft;
  const fmt = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-4 relative">
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serverResponse={serverResponse}
      />

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Repeat the sentence you hear.
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the sentence and repeat it. You will have {RECORD_SECONDS}
        seconds to record your response. <br />
        Repeat the sentence as accurately as possible.
      </p>

      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
        {question.audioUrl && (
          <audio
            ref={audioRef}
            src={question.audioUrl}
            onPlay={handleAudioPlay}
            onEnded={handleAudioEnded}
            controls
            style={{ width: "100%" }}
          />
        )}
      </div>

      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line min-h-[34px]">
        {question.prompt}
      </div>

      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 w-10 text-right">{fmt(elapsed)}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-[#810000] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10">{fmt(RECORD_SECONDS)}</span>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mb-5">
          {isRecording
            ? "Recording... Speak now"
            : audioBlob
              ? "Recording complete"
              : "Press Start to begin recording"}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-40 transition"
            onClick={() => {
              setAudioBlob(null);
              setTimeLeft(RECORD_SECONDS);
              setIsRecording(false);
            }}
            disabled={isRecording || isSubmitting}
          >
            Restart
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-[#810000] text-white font-semibold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition"
            onClick={startRecording}
            disabled={isRecording || timeLeft === 0 || isSubmitting}
          >
            Start
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gray-500 text-white font-semibold text-sm hover:bg-gray-600 disabled:opacity-40 transition"
            onClick={stopRecording}
            disabled={!isRecording || isSubmitting}
          >
            Stop
          </button>
          <button
            className="px-7 py-2 rounded-lg bg-[#810000] text-white font-bold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition"
            onClick={handleSubmit}
            disabled={!audioBlob || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
