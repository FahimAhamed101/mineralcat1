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
  Monitor,
  Share2,
  X,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Multi-answer selection
  const [selected, setSelected] = useState([]);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Simplified score data
  const [resultData, setResultData] = useState({
    score: 0,
    maxScore: 0,
    feedback: "",
    timeTaken: "00:00",
  });

  // Function to speak the clicked word
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  };

  // Render prompt text with interactive words
  const renderPromptText = (text) => {
    return text.split(/\s+/).map((word, index) => (
      <span 
        key={index}
        className="word hover:text-red-600 transition-colors cursor-pointer"
        onClick={() => speakWord(word)}
        style={{ display: 'inline-block', marginRight: '4px' }}
      >
        {word}
      </span>
    ));
  };

  // Fetch all questions and find current index
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        let idx = 0;
        let questionObj = null;

        if (
          data.questions &&
          Array.isArray(data.questions) &&
          data.questions.length
        ) {
          arr = data.questions;
          idx = arr.findIndex((q) => q._id === id);
          questionObj = arr[idx !== -1 ? idx : 0];
        } else if (data.question) {
          arr = [data.question];
          idx = 0;
          questionObj = data.question;
        }

        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);
        setSelected([]);
        setStartTime(null); // Reset start time on new question
      } catch {
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setSelected([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
    // eslint-disable-next-line
  }, [id]);

  // Timer logic (start on page load)
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) setTimerStarted(true);
  }, [loading]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) return;

    // Set start time when timer first starts
    if (startTime === null) {
      setStartTime(Date.now());
    }

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft, startTime]);

  // Handle option change (multiple)
  const handleOptionChange = (idx) => {
    setSelected((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  // Format MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Submit handler with time tracking
  const handleSubmit = async () => {
    if (!currentQ || selected.length === 0) return;

    setIsSubmitting(true); // Start submitting

    const timeTaken = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    // Get the selected answer texts
    const selectedAnswers = selected.map((idx) => currentQ.options[idx]);

    try {
      // Submit and get the result
      const resultResponse = await fetchWithAuth(
        `${baseUrl}/test/reading/mcq_multiple/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQ._id,
            answer: selectedAnswers,
          }),
        }
      );

      const result = await resultResponse.json();
      const assessment = getQuestionAssessment(result, "mcq_multiple");

      // Update state with the simple result
      setResultData({
        score: assessment?.score ?? result.score ?? 0,
        maxScore: assessment?.maxScore ?? result.totalCorrectAnswers ?? 0,
        feedback: assessment?.feedback || result.feedback,
        timeTaken: formatTime(timeTaken),
      });

      setShowAiScoreModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
    } finally {
      setIsSubmitting(false); // End submitting
    }
  };

  // Pagination controls (dropdown + prev/next, styled right-bottom)
  const renderPagination = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-max">
      <div className="relative">
        <button
          className="rounded border bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {String(currentIdx + 1).padStart(3, "0")}
          {dropdownOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 bottom-11 w-36 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/mcq-multiple/${q._id}`);
                  setDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm font-semibold transition
                  ${
                    i === currentIdx
                      ? "bg-[#810000] text-white"
                      : "hover:bg-[#f5eaea] text-[#810000]"
                  }
                `}
              >
                {String(i + 1).padStart(3, "0")}{" "}
                {q.heading && (
                  <span className="ml-1 truncate w-24">{q.heading}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex mt-2 gap-2">
        <button
          aria-label="Prev"
          onClick={() => {
            if (currentIdx > 0) {
              router.push(
                `/question/mcq-multiple/${questions[currentIdx - 1]._id}`
              );
            }
          }}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          aria-label="Next"
          onClick={() => {
            if (currentIdx < questions.length - 1) {
              router.push(
                `/question/mcq-multiple/${questions[currentIdx + 1]._id}`
              );
            }
          }}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
          background: #eee;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #dedede;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Multiple answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting all
        correct responses. You may select more than one response.
      </p>

      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
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
        {renderPromptText(currentQ.prompt)}
      </div>

      {/* MCQ Question */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        {currentQ.text}
      </div>

      {/* Options */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-2 cursor-pointer select-none group ${
                selected.includes(i)
                  ? "bg-[#f5eaea] border-2 border-[#810000] rounded"
                  : ""
              }`}
              style={{
                transition: "background 0.1s, border 0.1s",
                padding: "0.25rem 0.5rem",
              }}
            >
              <input
                type="checkbox"
                name="mcq"
                checked={selected.includes(i)}
                onChange={() => handleOptionChange(i)}
                className="accent-[#810000] w-4 h-4"
                style={{ accentColor: "#810000" }}
                disabled={isSubmitting}
              />
              <span
                className={`text-base font-bold flex items-center justify-center w-7 h-7 rounded-full border border-[#810000] ${
                  selected.includes(i)
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
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            setSelected([]);
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
            setStartTime(null);
          }}
          disabled={timeLeft === 0 || isSubmitting}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-2 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#810000]"
          onClick={handleSubmit}
          disabled={selected.length === 0 || timeLeft === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {renderPagination()}

      {/* Simplified Result Modal */}
      {showAiScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#810000]">Your Result</h2>
              <button
                onClick={() => setShowAiScoreModal(false)}
                className="text-gray-500 hover:text-[#810000]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Taken */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-1">Time Taken:</p>
              <p className="text-xl font-bold text-[#810000]">
                {resultData.timeTaken}
              </p>
            </div>

            {/* Score Summary */}
            <div className="text-center mb-6">
                <p className="text-4xl font-bold text-[#810000] mb-2">
                  {resultData.score}
                  {resultData.maxScore ? `/${resultData.maxScore}` : ""}
                </p>
              <p className="text-gray-600 text-lg">{resultData.feedback}</p>
            </div>

            <button
              className="w-full mt-4 px-4 py-3 bg-[#810000] text-white rounded-lg hover:bg-[#a50000] transition font-semibold"
              onClick={() => setShowAiScoreModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .word:hover {
          color: #810000 !important;
        }
      `}</style>
    </div>
  );
}
