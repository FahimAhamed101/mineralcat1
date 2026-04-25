"use client";
import { use, useEffect, useRef, useState } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentSkill,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import MicRecorder from "mic-recorder-to-mp3";

const RECORD_SECONDS = 10;
const AUDIO_DURATION = 35;

function getAnswerShortQuestionResultData(serverResponse) {
  const assessment = getQuestionAssessment(serverResponse, "answer_short_question");

  return {
    speakingScore: getAssessmentSkill(assessment, "speaking")?.score ?? 0,
    listeningScore: getAssessmentSkill(assessment, "listening")?.score ?? 0,
    fluency: getAssessmentTrait(assessment, "fluency")?.score ?? 0,
    pronunciation: getAssessmentTrait(assessment, "pronunciation")?.score ?? 0,
    enablingSkills: getAssessmentMeta(assessment, "enablingSkills", "NO"),
    predictedText: getAssessmentMeta(assessment, "predictedText", ""),
    correctText: getAssessmentMeta(assessment, "correctText", ""),
    matchedExpectedAnswer: getAssessmentMeta(assessment, "matchedExpectedAnswer", false),
  };
}

function ScoreGauge({ value, max = 1, label, color = "#810000", footer = "" }) {
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
          {Number(value).toFixed(0)}
        </text>
      </svg>
      <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{label}</span>
      {footer ? <span className="text-[11px] font-medium text-gray-400">{footer}</span> : null}
    </div>
  );
}

function EnablingSkillRow({ label, value, isYesNo = false }) {
  const numericValue = Number(value);
  const isAffirmative = String(value || "").toUpperCase() === "YES";
  const barWidth = isYesNo ? (isAffirmative ? "100%" : "10%") : `${Math.min(100, Math.max(0, numericValue * 100))}%`;
  const displayValue = isYesNo ? (isAffirmative ? "Yes" : "No") : `${numericValue.toFixed(0)}/1`;

  return (
    <div className="grid grid-cols-[120px_1fr_70px] items-center gap-4">
      <p className="text-sm font-medium text-[#3A3128]">{label}</p>
      <div className="h-2 rounded-full bg-white/70 overflow-hidden">
        <div className="h-2 rounded-full bg-[#1ec7c3]" style={{ width: barWidth }} />
      </div>
      <p className="text-sm text-right text-[#3A3128]">{displayValue}</p>
    </div>
  );
}

function ResultModal({ isOpen, onClose, serverResponse, question }) {
  const scoreData = getAnswerShortQuestionResultData(serverResponse);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const expectedAnswer = scoreData.correctText || question?.correctText || "Not provided";
  const recognizedAnswer = scoreData.predictedText || "No speech detected";
  const isCorrect = Boolean(scoreData.matchedExpectedAnswer || scoreData.speakingScore >= 1);

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
            <h2 className="text-white text-xl font-bold">Answer Short Question - AI Score</h2>
            <p className="text-white/75 text-sm mt-0.5">Scored against the expected answer</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
          >
            x
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Answer Check
              </p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-[#d7ece0] bg-[#fbfffc] p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Expected Answer
                </p>
                <p className="text-[15px] leading-7 text-gray-800">{expectedAnswer}</p>
              </div>

              <div className="rounded-xl border border-[#f5c6c6] bg-[#fff5f5] p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Recognized Answer
                </p>
                <p className="text-[15px] leading-7 text-gray-800">{recognizedAnswer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f5c6c6] bg-[#fff5f5] px-4 py-3">
            <p className="text-sm font-bold text-[#810000]">AI Score</p>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {isCorrect ? "Correct Answer" : "Needs Practice"}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Communicative Skills
            </p>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                <ScoreGauge
                  value={scoreData.speakingScore}
                  max={1}
                  label="Speaking"
                  color="#810000"
                  footer="Out of 1"
                />
              </div>
              <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                <ScoreGauge
                  value={scoreData.listeningScore}
                  max={1}
                  label="Listening"
                  color="#c0392b"
                  footer="Out of 1"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Enabling Skills
            </p>
            <div className="overflow-hidden rounded-2xl border border-[#61dff2]">
              <div className="bg-[#55c7cb] px-4 py-2 text-center text-white font-semibold">
                Enabling Skills
              </div>
              <div className="space-y-4 bg-[#f5ffff] px-5 py-5">
                <EnablingSkillRow label="Content" value={scoreData.enablingSkills} isYesNo />
                <EnablingSkillRow label="Fluency" value={scoreData.fluency} />
                <EnablingSkillRow label="Pronunciation" value={scoreData.pronunciation} />
              </div>
            </div>
          </div>

          <div className="bg-[#fffbea] border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-bold mb-1">Evaluation rule</p>
            <p>
              This task uses a direct expected-answer comparison. Matching the stored correct
              answer gives a score of 1; otherwise the score is 0.
            </p>
            <p className="mt-2">
              Enabling skills: <span className="font-semibold">{scoreData.enablingSkills}</span>
            </p>
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

export default function AnswerShortQuestionPage({ params }) {
  const { id } = use(params);
  const baseURL = process.env.NEXT_PUBLIC_URL;

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const timerRef = useRef();
  const audioRef = useRef();
  const recorder = useRef(new MicRecorder({ bitRate: 128 }));

  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch {
        setQuestion(null);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setAudioProgress(0);
      setAudioBlob(null);
      setIsRecording(false);
    }

    getQuestion();
    // eslint-disable-next-line
  }, [id]);

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

  useEffect(() => {
    if (!audioPlaying) return;

    const handler = setInterval(() => {
      if (!audioRef.current) return;
      if (audioRef.current.ended || audioRef.current.paused) {
        setAudioPlaying(false);
        clearInterval(handler);
      } else {
        setAudioProgress(audioRef.current.currentTime);
      }
    }, 100);

    return () => clearInterval(handler);
  }, [audioPlaying]);

  const handleAudioPlayPause = () => {
    if (!audioRef.current) return;

    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const startRecording = async () => {
    try {
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch (error) {
      console.error("Recording failed", error);
    }
  };

  const stopRecording = async () => {
    try {
      const [, blob] = await recorder.current.stop().getMp3();
      setAudioBlob(blob);
      setIsRecording(false);
    } catch {
      setAudioBlob(null);
      setIsRecording(false);
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
        `${baseURL}/test/speaking/answer_short_question/result`,
        {
          method: "POST",
          body: formData,
        }
      );
      setServerResponse(await response.json());
      setIsModalOpen(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
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
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serverResponse={serverResponse}
        question={question}
      />

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Answer a Short Question
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the question and answer briefly. You will have {RECORD_SECONDS}
        seconds to record your response. <br />
        Keep your answer short and direct.
      </p>

      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex flex-wrap md:flex-nowrap items-center gap-2">
        <span>#{question._id}</span>
        <span>|</span>
        <span>{question.heading}</span>
      </div>

      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
        <div className="w-full flex items-center gap-2">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center shadow bg-[#810000] text-white hover:bg-[#5d0000] mr-3"
            onClick={handleAudioPlayPause}
            aria-label={audioPlaying ? "Pause audio" : "Play audio"}
            style={{ minWidth: 48 }}
          >
            {audioPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
              </svg>
            )}
          </button>
          <audio
            ref={audioRef}
            src={question.audioUrl || ""}
            preload="auto"
            style={{ display: "none" }}
            onEnded={() => setAudioPlaying(false)}
            onPause={() => setAudioPlaying(false)}
            onPlay={() => setAudioPlaying(true)}
          />
          <span className="text-xs text-gray-600">{audioProgress.toFixed(2).padStart(4, "0")}</span>
          <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden relative">
            <div
              className="h-2 rounded bg-[#810000] transition-all duration-200"
              style={{ width: `${((audioProgress || 0) / AUDIO_DURATION) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{AUDIO_DURATION.toFixed(2)}</span>
          <span className="ml-2">
            <svg width="22" height="22" fill="#810000" viewBox="0 0 24 24">
              <path d="M17 7v10M21 9v6M13 5v14M9 7v10M5 9v6" />
            </svg>
          </span>
        </div>
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
            disabled={isRecording || timeLeft === 0 || audioPlaying || isSubmitting}
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
