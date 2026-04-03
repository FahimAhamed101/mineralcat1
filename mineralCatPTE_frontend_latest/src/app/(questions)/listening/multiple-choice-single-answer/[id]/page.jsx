"use client";
import React, { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { getQuestionAssessment } from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_URL;

  // State
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  //==================Modal States======================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionTime, setSubmissionTime] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Single-answer selection
  const [selected, setSelected] = useState(null);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch the question (single, no fake data)
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);
        const data = await res.json();
        if (data?.question) {
          setCurrentQ(data.question);
          setSelected(null);
        } else {
          setCurrentQ(null);
          setSelected(null);
        }
      } catch {
        setCurrentQ(null);
        setSelected(null);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) setTimerStarted(true);
  }, [loading]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) return;
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ || selected === null || isSubmitting) return;
    setIsSubmitting(true);

    // Calculate time taken
    const timeTaken = RECORD_SECONDS - timeLeft;
    setSubmissionTime(timeTaken);

    const selectedAnswers = [currentQ.options[selected]];
    const payload = {
      questionId: currentQ._id,
      answer: selectedAnswers, // Changed from selectedAnswers to answer as per your requirement
    };

    try {
      const response = await fetchWithAuth(
        `${baseURL}/test/listening/multiple-choice-single-answers/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Submission failed");
      }

      setServerResponse(result);
      setIsModalOpen(true);
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format MM:SS
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  // Enhanced Modal Component
  const renderResultModal = () => (
    <EnhancedModal
      isModalOpen={isModalOpen}
      setIsModalOpen={() => setIsModalOpen(false)}
      serverResponse={serverResponse}
      submissionTime={submissionTime}
      formatTime={formatTime}
      onClose={() => {
        setIsModalOpen(false);
        // Optionally redirect or reset the quiz
      }}
    />
  );

  // Pagination controls (dropdown + prev/next, styled right-bottom)
  const renderPagination = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-max">
      {renderResultModal()}
    </div>
  );

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Single answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting the
        correct response. Only one response is correct.
      </p>
      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading}
        </span>
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {currentQ.audioUrl && <AudioPlayer src={currentQ.audioUrl} />}
        {currentQ.prompt && (
          <div className="mt-2 text-[#333] text-base">{currentQ.prompt}</div>
        )}
      </div>
      {/* MCQ Question */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        Please select only one correct answer from the options below.
      </div>
      {/* Options */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-2 cursor-pointer select-none group ${
                selected === i
                  ? "bg-[#f5eaea] border-2 border-[#810000] rounded"
                  : ""
              }`}
              style={{
                transition: "background 0.1s, border 0.1s",
                padding: "0.25rem 0.5rem",
              }}
            >
              <input
                type="radio"
                name="mcq"
                checked={selected === i}
                onChange={() => setSelected(i)}
                className="accent-[#810000] w-4 h-4"
                style={{ accentColor: "#810000" }}
              />
              <span
                className={`text-base font-bold flex items-center justify-center w-7 h-7 rounded-full border border-[#810000] ${
                  selected === i
                    ? "bg-[#810000] text-white"
                    : "bg-white text-[#810000]"
                }`}
                style={{
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                {abc}
              </span>
              <span className="text-gray-800 font-normal text-base">{opt}</span>
            </label>
          );
        })}
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={() => {
            setSelected(null);
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
          }}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={selected === null || timeLeft === 0 || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      {renderPagination()}
    </div>
  );
}

//==================Enhanced Modal=======================
const EnhancedModal = ({
  isModalOpen,
  setIsModalOpen,
  serverResponse,
  submissionTime,
  formatTime,
  onClose,
}) => {
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const { result, feedback } = serverResponse;
  const assessment = getQuestionAssessment(
    serverResponse,
    "listening_multiple_choice_single_answers"
  );
  const isCorrect = assessment?.meta?.isCorrect ?? result?.correctAnswersGiven;
  const score = assessment?.score ?? result?.score ?? 0;
  const totalQuestions = assessment?.maxScore ?? result?.totalCorrectAnswers ?? 1;

  return (
    <div
      onClick={setIsModalOpen}
      className="h-dvh w-full fixed inset-0 z-50 bg-black/60 flex flex-col justify-center items-center backdrop-blur-sm mt-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div
          className={`${
            isCorrect
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          } p-6 text-white text-center`}
        >
          <div className="flex justify-center mb-3">
            {isCorrect ? (
              <CheckCircle className="w-16 h-16 text-white" />
            ) : (
              <XCircle className="w-16 h-16 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isCorrect ? "Excellent!" : "Try Again!"}
          </h2>
          <p className="text-white/90">
            {isCorrect ? "You got it right!" : "Better luck next time!"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Score Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">Your Score</span>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-[#810000]">
                  {score}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${(score / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Time Section */}
          {submissionTime !== null && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Time Taken</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {formatTime(submissionTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {feedback && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Feedback</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {feedback}
              </p>
            </div>
          )}

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-lg font-bold text-purple-600">
                {totalQuestions || 0}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Status</p>
              <p
                className={`text-lg font-bold ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-[#810000] hover:bg-[#660000] text-white font-semibold py-3 px-6 rounded-xl transition duration-200 transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
