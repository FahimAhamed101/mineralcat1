"use client";
import React, { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { getQuestionAssessment } from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Dropdown answers
  const [answers, setAnswers] = useState([]);

  // Response state
  const [showResponse, setShowResponse] = useState(false);
  const [responseData, setResponseData] = useState(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all questions and find current index
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        // Fetch the question list for pagination
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        let arr = [];
        let idx = 0;
        let questionObj = null;
        if (res.ok) {
          const data = await res.json();
          // If API gives multiple questions (pagination), else fallback to single
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
        }
        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);
        // Answers array is based on blanks length
        setAnswers(Array(questionObj?.blanks?.length || 0).fill(""));
      } catch {
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setAnswers([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Timer logic (start on page load or when loading is complete)
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) {
      setTimerStarted(true);
    }
  }, [loading, timerStarted]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) {
      clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Answer change handler
  const handleAnswerChange = (idx) => (e) => {
    const arr = [...answers];
    arr[idx] = e.target.value;
    setAnswers(arr);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ) return;

    setIsSubmitting(true); // Set submitting state

    // Create payload in the required format
    const payload = {
      questionId: currentQ._id,
      answer: answers.filter((ans) => !!ans),
    };

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/reading/reading-fill-in-the-blanks/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponseData({
          ...data,
          assessment: getQuestionAssessment(data, "reading_fill_in_the_blanks"),
        });
        setShowResponse(true);
      } else {
        alert("Something went wrong! Try again.");
      }
    } catch (e) {
      console.error("Submit error:", e);
      alert("Something went wrong! Try again.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Pagination controls
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/reading-writing-blanks/${questions[idx]._id}`);
  };

  // Render pagination
  const renderPagination = () => (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        aria-label="Previous question"
        onClick={() => goToIndex(currentIdx - 1)}
        disabled={currentIdx === 0}
        className={`rounded-full border bg-white p-2 shadow text-[#810000] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-[#810000] hover:text-white`}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <div className="flex items-center gap-2">
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white text-sm md:text-base">
          {String(currentIdx + 1).padStart(3, "0")}
        </span>
        <span className="text-gray-500 font-medium">/</span>
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white text-sm md:text-base">
          {String(questions.length).padStart(3, "0")}
        </span>
      </div>
      <button
        aria-label="Next question"
        onClick={() => goToIndex(currentIdx + 1)}
        disabled={currentIdx === questions.length - 1}
        className={`rounded-full border bg-white p-2 shadow text-[#810000] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-[#810000] hover:text-white`}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );

  // Format MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Function to speak the clicked word
  const speakWord = (word) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported in this browser");
    }
  };

  // Render prompt text with interactive words
  const renderPromptText = (text) => {
    return text.split(/\s+/).map((word, index) => (
      <span
        key={index}
        className="word hover:text-red-600 transition-colors cursor-pointer"
        onClick={() => speakWord(word)}
        style={{ display: "inline-block", marginRight: "4px" }}
      >
        {word}
      </span>
    ));
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg font-medium text-gray-600">
        Loading...
      </div>
    );
  }

  // Prompt split for blanks
  const prompt = currentQ.prompt || "";
  const blanks = currentQ.blanks || [];
  let splitParts = [];
  let regex = /___/g;
  let match;
  let cursor = 0;

  if (prompt.match(/\([a-e]\)/g)) {
    regex = /\([a-e]\)/g;
  }

  while ((match = regex.exec(prompt))) {
    splitParts.push(prompt.slice(cursor, match.index));
    cursor = match.index + match[0].length;
  }
  splitParts.push(prompt.slice(cursor));

  return (
    <div className="w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto py-4 px-4 sm:py-6 sm:px-6 relative">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#810000] border-b-2 border-[#810000] pb-2 mb-4 sm:mb-6">
        Reading & Writing Blanks
      </h1>
      <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
        Below is a text with blanks. Click on each blank, a list of choices will
        appear. Select the appropriate answer choice for each blank.
      </p>

      {/* Question Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
        <span className="rounded px-3 py-1 sm:px-4 sm:py-2 font-bold text-white bg-[#810000] text-sm sm:text-base tracking-wide min-w-[70px] text-center">
          #{currentQ._id}
        </span>
        {currentQ.heading && (
          <h2 className="text-lg sm:text-xl font-semibold text-[#810000] mt-2 sm:mt-0">
            {currentQ.heading}
          </h2>
        )}
      </div>

      {/* Timer */}
      <div className="mb-4 flex items-center gap-3 text-sm sm:text-base">
        <span className="text-[#810000] font-medium">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>

      {/* Prompt with answer dropdowns */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-4 sm:p-5 mb-4 text-gray-900 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {splitParts.map((part, i) => (
          <React.Fragment key={i}>
            {renderPromptText(part)}
            {i < blanks.length && (
              <span className="inline-block align-middle mx-0.5 sm:mx-1">
                <span className="font-bold text-[#810000] mr-1">
                  {(prompt.match(/\([a-e]\)/g) &&
                    prompt.match(/\([a-e]\)/g)[i]) ||
                    `(${String.fromCharCode(97 + i)})`}
                </span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Answer options below */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
        {blanks.map((blank, i) => (
          <div key={i} className="flex-1">
            <select
              value={answers[i] || ""}
              onChange={handleAnswerChange(i)}
              className="w-full border border-[#810000] bg-white rounded-md px-3 py-2 text-[#810000] font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] appearance-none text-sm sm:text-base cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1em",
              }}
            >
              <option value="">{`(${String.fromCharCode(
                97 + i
              )}) Select answer`}</option>
              {blank.options.map((opt, j) => (
                <option key={j} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-sm sm:text-base transition-colors duration-200"
          onClick={() => {
            setAnswers(Array(currentQ.blanks?.length || 0).fill(""));
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
            setShowResponse(false);
            setResponseData(null);
          }}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className={`flex items-center gap-1 px-5 py-2 rounded-md border-2 border-[#810000] bg-white text-[#810000] font-semibold text-sm sm:text-base hover:bg-[#810000] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center ${
            isSubmitting ? "opacity-70" : ""
          }`}
          onClick={handleSubmit}
          disabled={answers.some((a) => !a) || timeLeft === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#810000]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {/* Response Modal */}
      {showResponse && responseData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Quiz Result</h3>
              <button
                onClick={() => setShowResponse(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold text-[#810000] mb-2">
                  {responseData.assessment?.score ?? responseData.result.score}
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  out of {responseData.assessment?.maxScore ?? responseData.result.totalBlanks}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-[#810000] h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        responseData.assessment?.percentage ??
                        ((responseData.result.score /
                          responseData.result.totalBlanks) *
                        100)
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="text-2xl font-semibold text-[#810000]">
                  {Math.round(
                    responseData.assessment?.percentage ??
                      ((responseData.result.score /
                        responseData.result.totalBlanks) *
                      100)
                  )}
                  %
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-lg">{responseData.feedback}</p>
              </div>

              <button
                onClick={() => setShowResponse(false)}
                className="w-full bg-[#810000] text-white py-3 rounded-lg font-semibold hover:bg-[#950000] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {renderPagination()}

      <style jsx>{`
        select:disabled {
          background: #eee;
          color: #bbb;
        }
        .word:hover {
          color: #810000 !important;
        }
      `}</style>
    </div>
  );
}
