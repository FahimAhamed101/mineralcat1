"use client";
import React, {
  use,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { getQuestionAssessment } from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Enhanced Result Modal Component
const ResultModal = React.memo(function ResultModal({
  isOpen,
  onClose,
  result,
  assessment,
  feedback,
  userAnswers,
  correctAnswers,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scoreValue = Number(assessment?.score ?? result?.score);
  const totalCorrectAnswers = Number(
    assessment?.maxScore ?? result?.totalCorrectAnswers
  );
  const hasScore = Number.isFinite(scoreValue);
  const hasTotalCorrectAnswers = Number.isFinite(totalCorrectAnswers);
  const normalizedScore = hasScore ? scoreValue : 0;
  const normalizedTotalCorrectAnswers = hasTotalCorrectAnswers
    ? totalCorrectAnswers
    : 0;
  const scorePercentage =
    normalizedTotalCorrectAnswers > 0
      ? (normalizedScore / normalizedTotalCorrectAnswers) * 100
      : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] bg-black/60 flex justify-center items-center backdrop-blur-sm transition-all p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl px-6 py-6 flex flex-col gap-4 items-center relative border border-[#810000]/20 max-w-2xl w-full animate-popup max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7D0000] hover:text-[#810000] text-xl cursor-pointer font-bold bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#810000] focus:ring-offset-2"
          title="Close (Esc)"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <h2 id="modal-title" className="text-2xl font-bold text-[#810000]">
            Results
          </h2>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4 w-full mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
            <div className="text-sm font-semibold text-blue-700 mb-1">
              Score
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {hasScore ? normalizedScore : "-"}/
              {hasTotalCorrectAnswers ? normalizedTotalCorrectAnswers : "-"}
            </div>
            {hasScore && hasTotalCorrectAnswers && (
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
            <div className="text-sm font-semibold text-green-700 mb-1">
              Total Correct
            </div>
            <div className="text-2xl font-bold text-green-800">
              {assessment?.maxScore ?? result?.totalCorrectAnswers ?? "-"}
            </div>
            <div className="text-xs text-green-600 mt-1">Available</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
            <div className="text-sm font-semibold text-purple-700 mb-1">
              Your Correct
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {hasScore ? normalizedScore : "-"}
            </div>
            {hasScore && hasTotalCorrectAnswers && (
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Indicator */}
        {hasScore && (
          <div className="w-full mb-4">
            <div
              className={`text-center p-3 rounded-lg ${
                normalizedTotalCorrectAnswers > 0 &&
                normalizedScore / normalizedTotalCorrectAnswers >= 0.7
                  ? "bg-green-100 text-green-800"
                  : normalizedTotalCorrectAnswers > 0 &&
                    normalizedScore / normalizedTotalCorrectAnswers >= 0.5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div className="font-semibold">
                {normalizedTotalCorrectAnswers > 0 &&
                normalizedScore / normalizedTotalCorrectAnswers >= 0.7
                  ? "🎉 Excellent!"
                  : normalizedTotalCorrectAnswers > 0 &&
                    normalizedScore / normalizedTotalCorrectAnswers >= 0.5
                  ? "👍 Good Job!"
                  : "💪 Keep Practicing!"}
              </div>
              <div className="text-sm mt-1">
                You scored {normalizedScore} out of{" "}
                {hasTotalCorrectAnswers ? normalizedTotalCorrectAnswers : "-"}
              </div>
            </div>
          </div>
        )}

        {/* Answer Review */}
        {userAnswers && correctAnswers && (
          <div className="w-full mb-4">
            <h3 className="font-bold text-[#810000] mb-3">Answer Review:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userAnswers.map((userAnswer, index) => {
                const isCorrect = userAnswer === correctAnswers[index];
                return (
                  <div
                    key={index}
                    className={`p-2 rounded-lg border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">
                        {String.fromCharCode(97 + index)}){/* (a), (b), ... */}
                      </span>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={
                          isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        Your answer:{" "}
                        <strong>{userAnswer || "Not answered"}</strong>
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="text-xs text-gray-600 mt-1 ml-6">
                        Correct answer: <strong>{correctAnswers[index]}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="w-full">
          <div className="font-bold text-[#810000] mb-2 flex items-center gap-2">
            <span>Feedback:</span>
          </div>
          <div className="bg-gradient-to-r from-[#faf9f9] to-gray-50 p-4 rounded-xl border border-[#810000]/20 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {feedback ||
                "Great job completing the exercise! Keep practicing to improve your listening skills."}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 px-4 py-3 bg-[#810000] text-white rounded-xl hover:bg-[#5d0000] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#810000] focus:ring-offset-2"
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-popup {
          animation: popup 0.35s cubic-bezier(0.2, 1.5, 0.5, 1) both;
        }
        @keyframes popup {
          0% { 
            transform: scale(0.8) translateY(40px); 
            opacity: 0;
          }
          100% { 
            transform: scale(1) translateY(0); 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default function DynamicPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // State
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerRef = useRef();

  // Dropdown answers for blanks
  const [answers, setAnswers] = useState([]);

  // Fetch question and set state
  const getQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data && data.question) {
        setCurrentQ(data.question);
        // Initial answers: one for each blank, empty string
        setAnswers(Array(data.question.blanks?.length || 0).fill(""));
      } else {
        throw new Error("No question found in response");
      }
    } catch (err) {
      console.error("Failed to fetch question:", err);
      setError(err.message);
      setCurrentQ(null);
      setAnswers([]);
    } finally {
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
      setTimerPaused(false);
    }
  }, [baseUrl, id]);

  useEffect(() => {
    getQuestion();
  }, [getQuestion]);

  // Timer logic (start on page load)
  useEffect(() => {
    if (loading || !currentQ) return;
    if (!timerStarted) {
      setTimerStarted(true);
    }
  }, [loading, currentQ, timerStarted]);

  useEffect(() => {
    if (!timerStarted || timerPaused || timeLeft === 0) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timerPaused, timeLeft]);

  // Answer change handler
  const handleAnswerChange = useCallback(
    (idx) => (e) => {
      if (timeLeft === 0) return;

      const arr = [...answers];
      arr[idx] = e.target.value;
      setAnswers(arr);
    },
    [answers, timeLeft]
  );

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!currentQ || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setTimerPaused(true); // Pause timer during submission

    const payload = {
      questionId: currentQ._id,
      answer: answers,
    };

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/listening/listening-fill-in-the-blanks/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      setServerResponse(result);
      setIsModalOpen(true);

      console.log("✅ Submission successful:", result);
    } catch (err) {
      console.error("🔥 Submission failed:", err);
      setError(err.message);
      setTimerPaused(false); // Resume timer on error
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQ, answers, baseUrl, isSubmitting]);

  // Restart handler
  const handleRestart = useCallback(() => {
    setAnswers(Array(currentQ?.blanks?.length || 0).fill(""));
    setTimeLeft(RECORD_SECONDS);
    setTimerStarted(true);
    setTimerPaused(false);
    setError(null);
  }, [currentQ]);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setTimerPaused((prev) => !prev);
  }, []);

  // Format MM:SS
  const formatTime = useCallback((sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  // Timer color based on remaining time
  const timerColor = useMemo(() => {
    if (timeLeft <= 60) return "text-red-600";
    if (timeLeft <= 180) return "text-yellow-600";
    return "text-[#810000]";
  }, [timeLeft]);

  // Check if all answers are filled
  const allAnswersFilled = useMemo(() => {
    return (
      answers.length > 0 && answers.every((answer) => answer.trim() !== "")
    );
  }, [answers]);

  // Completion progress
  const completionPercentage = useMemo(() => {
    if (answers.length === 0) return 0;
    const filledAnswers = answers.filter(
      (answer) => answer.trim() !== ""
    ).length;
    return (filledAnswers / answers.length) * 100;
  }, [answers]);

  // Close modal handler
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setServerResponse({});
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#810000]"></div>
        <span className="ml-2 text-[#810000]">Loading question...</span>
      </div>
    );
  }

  // Error state
  if (error && !currentQ) {
    return (
      <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2">
        <div className="flex items-center justify-center min-h-[40vh] text-center">
          <div>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Question
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={getQuestion}
              className="px-4 py-2 bg-[#810000] text-white rounded hover:bg-[#5d0000] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-gray-600">No question available</span>
      </div>
    );
  }

  // Prompt split for blanks
  const prompt = currentQ.prompt || "";
  const blanks = currentQ.blanks || [];
  const blankMarker = "__________";

  // Split prompt by blank markers
  let splitParts = [];
  if (prompt.includes(blankMarker)) {
    splitParts = prompt.split(blankMarker);
  } else {
    splitParts = [prompt];
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* Enhanced Result Modal */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        result={serverResponse?.result}
        assessment={getQuestionAssessment(serverResponse, "listening_fill_in_the_blanks")}
        feedback={serverResponse?.feedback}
        userAnswers={answers}
        correctAnswers={blanks.map((blank) => blank.correctAnswer)}
      />

      {/* Header */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Listening Fill in the Blanks
      </div>

      <p className="text-gray-700 mb-6">
        Listen to the audio and fill in the blanks in the passage by selecting
        the correct answer for each blank.
      </p>

      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="rounded-lg px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000] ">
          {currentQ.heading}
        </span>
      </div>

      {/* Enhanced Timer */}
      <div className="mb-4 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border">
        <Clock className={`w-5 h-5 ${timerColor}`} />
        <span className="text-gray-700 font-medium text-base">
          Remaining Time:{" "}
          <span className={`font-bold text-lg ${timerColor}`}>
            {formatTime(timeLeft)}
          </span>
        </span>

        {timeLeft <= 60 && timeLeft > 0 && (
          <span className="text-red-600 text-sm font-medium animate-pulse">
            ⚠️ Time running out!
          </span>
        )}

        <button
          onClick={toggleTimer}
          className="ml-auto px-3 py-1 text-sm bg-white border border-[#810000] text-[#810000] rounded hover:bg-[#810000] hover:text-white transition-colors flex items-center gap-1"
          disabled={timeLeft === 0}
        >
          {timerPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
          {timerPaused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4 bg-gray-50 p-3 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {answers.filter((a) => a.trim() !== "").length} of{" "}
            {answers.length} blanks filled
          </span>
          <span className="text-sm font-medium text-[#810000]">
            {Math.round(completionPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#810000] h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Audio Player */}
      {currentQ.audioUrl && (
        <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base">
          <AudioPlayer src={currentQ.audioUrl} />
        </div>
      )}

      {/* Enhanced Prompt with Blanks */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base">
        {splitParts.length > 1 && blanks.length > 0 ? (
          // Inline blanks
          <div className="leading-relaxed">
            {splitParts.map((part, i) => (
              <React.Fragment key={i}>
                <span className="whitespace-pre-line">{part}</span>
                {i < blanks.length && (
                  <span className="inline-block align-middle mx-1">
                    <select
                      value={answers[i] || ""}
                      onChange={handleAnswerChange(i)}
                      disabled={timeLeft === 0}
                      className={`border-2 bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] transition-colors min-w-[120px] ${
                        answers[i]
                          ? "border-[#810000] text-[#810000] bg-[#810000]/5"
                          : "border-gray-300 text-gray-500"
                      } ${
                        timeLeft === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      style={{
                        backgroundImage:
                          timeLeft > 0
                            ? "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"
                            : "none",
                        backgroundPosition: "right 0.75rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1em",
                      }}
                    >
                      <option value="">Select answer</option>
                      {blanks[i]?.options.map((opt, j) => (
                        <option key={j} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          // Separate blanks below
          <div>
            <div className="whitespace-pre-line mb-6 leading-relaxed">
              {prompt}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-[#810000] text-lg mb-3">
                Fill in the blanks:
              </h4>
              {blanks.map((blank, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <span className="font-bold text-[#810000] text-lg min-w-[2rem]">
                    {String.fromCharCode(97 + i)})
                  </span>
                  <select
                    value={answers[i] || ""}
                    onChange={handleAnswerChange(i)}
                    disabled={timeLeft === 0}
                    className={`border-2 bg-white rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] transition-colors flex-1 ${
                      answers[i]
                        ? "border-[#810000] text-[#810000] bg-[#810000]/5"
                        : "border-gray-300 text-gray-500"
                    } ${timeLeft === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundImage:
                        timeLeft > 0
                          ? "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"
                          : "none",
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1em",
                    }}
                  >
                    <option value="">Select answer</option>
                    {blank.options.map((opt, j) => (
                      <option key={j} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {answers[i] && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRestart}
          disabled={timeLeft === 0 && !isSubmitting}
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#810000]"
          onClick={handleSubmit}
          disabled={!allAnswersFilled || isSubmitting}
          title={
            !allAnswersFilled
              ? "Please fill in all blanks"
              : isSubmitting
              ? "Submitting..."
              : "Submit your answers"
          }
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit ({answers.filter((a) => a.trim() !== "").length}/
              {answers.length})
            </>
          )}
        </button>
      </div>

      {/* Answer Summary */}
      {answers.some((answer) => answer.trim() !== "") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <div className="font-semibold text-blue-800 mb-2">Your Answers:</div>
          <div className="space-y-1">
            {answers.map((answer, index) => (
              <div key={index} className="text-blue-700">
                <span className="font-medium">
                  {String.fromCharCode(97 + index)})
                </span>{" "}
                {answer || (
                  <span className="text-gray-400 italic">Not answered</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
