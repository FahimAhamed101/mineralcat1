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
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
} from "lucide-react";
import AudioPlayer from "@/components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Enhanced Result Modal Component with better styling and animations
const ResultModal = React.memo(function ResultModal({
  isOpen,
  onClose,
  result,
  assessment,
  feedback,
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
      className="fixed inset-0 z-[1000] bg-black/60 flex justify-center items-center backdrop-blur-sm transition-all p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl px-6 py-6 flex flex-col gap-4 items-center relative border border-[#810000]/20 max-w-lg w-full animate-popup max-h-[90vh] overflow-y-auto"
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
        <div className="flex items-center justify-center mb-2 gap-2">
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

        {/* Feedback Section */}
        <div className="w-full">
          <div className="font-bold text-[#810000] mb-2 flex items-center gap-2">
            <span>Feedback:</span>
          </div>
          <div className="bg-gradient-to-r from-[#faf9f9] to-gray-50 p-4 rounded-xl border border-[#810000]/20 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {feedback || "No feedback available at this time."}
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

function DynamicPageComponent({ params }) {
  const [serverResponse, setServerResponse] = useState({});
  const { id } = use(params);
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_URL;

  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerRef = useRef();

  const [selected, setSelected] = useState([]);

  // Memoized fetch function
  const getQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data?.question) {
        setCurrentQ(data.question);
        setSelected([]);
      } else {
        throw new Error("No question found in response");
      }
    } catch (err) {
      console.error("Failed to fetch question:", err);
      setError(err.message);
      setCurrentQ(null);
      setSelected([]);
    } finally {
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
      setTimerPaused(false);
    }
  }, [baseURL, id]);

  useEffect(() => {
    getQuestion();
  }, [getQuestion]);

  // Timer logic - start automatically when question loads
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

  // Memoized handlers
  const handleOptionChange = useCallback(
    (idx) => {
      if (timeLeft === 0) return;

      setSelected((prev) => {
        if (prev.includes(idx)) {
          return prev.filter((i) => i !== idx);
        } else {
          return [...prev, idx];
        }
      });
    },
    [timeLeft]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !currentQ) return;

    setIsSubmitting(true);
    setError(null);

    // Pause timer during submission
    setTimerPaused(true);

    try {
      const selectedAnswers = selected.map(
        (eachId) => currentQ.options[eachId]
      );
      const payload = {
        questionId: currentQ._id,
        answer: selectedAnswers,
      };

      const response = await fetchWithAuth(
        `${baseURL}/test/listening/multiple-choice-multiple-answers/result`,
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
  }, [currentQ, selected, baseURL, isSubmitting]);

  const handleRestart = useCallback(() => {
    setSelected([]);
    setTimeLeft(RECORD_SECONDS);
    setTimerStarted(true);
    setTimerPaused(false);
    setError(null);
  }, []);

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

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* Enhanced Result Modal */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        result={serverResponse?.result}
        assessment={getQuestionAssessment(serverResponse, "listening_multiple_choice_multiple_answers")}
        feedback={serverResponse?.feedback}
      />

      {/* Header */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice & Multiple Answer
      </div>

      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting all
        correct responses. You may select more than one response.
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Audio/Prompt Section */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base">
        {currentQ.audioUrl && (
          <div className="mb-4">
            <AudioPlayer src={currentQ.audioUrl} />
          </div>
        )}
        {currentQ.prompt && (
          <div className="text-[#333] text-base whitespace-pre-line leading-relaxed">
            {currentQ.prompt}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="border border-[#810000] rounded-lg bg-white p-3 mb-4 text-[#810000] text-base font-semibold">
        নিচের অপশনগুলো থেকে একাধিক সঠিক উত্তরের অপশন সিলেক্ট করুন।
      </div>

      {/* Enhanced Options */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-4 mb-4">
        <div className="mb-3 text-sm text-gray-600">
          Selected: {selected.length} option{selected.length !== 1 ? "s" : ""}
        </div>

        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          const isSelected = selected.includes(i);
          const isDisabled = timeLeft === 0;

          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-3 cursor-pointer select-none group p-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? "bg-[#810000]/10 border-2 border-[#810000] shadow-sm"
                  : "hover:bg-gray-50 border-2 border-transparent"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                name="mcq"
                checked={isSelected}
                onChange={() => handleOptionChange(i)}
                disabled={isDisabled}
                className="accent-[#810000] w-5 h-5 flex-shrink-0"
                style={{ accentColor: "#810000" }}
              />

              <span
                className={`text-base font-bold flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  isSelected
                    ? "bg-[#810000] text-white border-[#810000]"
                    : "bg-white text-[#810000] border-[#810000] group-hover:bg-[#810000]/5"
                }`}
              >
                {abc}
              </span>

              <span className="text-gray-800 font-normal text-base flex-1 leading-relaxed">
                {opt}
              </span>

              {isSelected && (
                <CheckCircle className="w-5 h-5 text-[#810000] flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>

      {/* Enhanced Controls */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRestart}
          disabled={timeLeft === 0 && !isSubmitting}
        >
          <span>🔄</span>
          Restart
        </button>

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#810000]"
          onClick={handleSubmit}
          disabled={selected.length === 0 || isSubmitting}
          title={
            selected.length === 0
              ? "Please select at least one option"
              : isSubmitting
              ? "Submitting..."
              : "Submit your answers"
          }
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4  border-current bg-[#810000]"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit ({selected.length})
            </>
          )}
        </button>
      </div>

      {/* Selection Summary */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="font-semibold text-blue-800 mb-1">
            Selected Options:
          </div>
          <div className="text-blue-700">
            {selected.map((idx) => String.fromCharCode(65 + idx)).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoized main component
const DynamicPage = React.memo(DynamicPageComponent);
export default DynamicPage;
