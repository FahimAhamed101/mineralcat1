"use client";
import React, { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  const [selected, setSelected] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissionTime, setSubmissionTime] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          if (data.questions[0]?.question) {
            arr = data.questions.map((q) => q.question);
          } else {
            arr = data.questions;
          }
          setQuestions(arr);
          const idx = arr.findIndex((q) => q._id === id);
          setCurrentIdx(idx !== -1 ? idx : 0);
          setCurrentQ(arr[idx !== -1 ? idx : 0]);
        } else if (data?.question) {
          setQuestions([data.question]);
          setCurrentQ(data.question);
          setCurrentIdx(0);
        } else {
          setQuestions([]);
          setCurrentQ(null);
          setCurrentIdx(0);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
        setCurrentQ(null);
        setCurrentIdx(0);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
      setSelected(null);
      setSubmitResult(null);
    }
    getQuestions();
  }, [id]);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentQ(questions[currentIdx] || null);
      setSelected(null);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
      setSubmitResult(null);
    }
  }, [questions, currentIdx]);

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

  const handleSubmit = async () => {
    if (!currentQ || selected === null) {
      setSubmitResult({
        error: true,
        message: "Please select an answer",
        success: false,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    const submissionTime = new Date();
    setSubmissionTime(submissionTime);

    const payload = {
      questionId: currentQ._id,
      answer: currentQ.options[selected],
    };

    try {
      const res = await fetchWithAuth(
        `${baseUrl}/test/reading/mcq_single/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${res.status}`
        );
      }

      const result = await res.json();
      setSubmitResult(result);
      setShowSubmissionModal(true);
      setTimerStarted(false);

      if (result.success) {
        setTimeout(() => {
          if (currentIdx < questions.length - 1) {
            router.push(
              `/question/mcq-single/${questions[currentIdx + 1]._id}`
            );
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitResult({
        error: true,
        message: err.message || "Failed to submit answer",
        success: false,
      });
      setShowSubmissionModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {questions.slice(0, 100).map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/mcq-single/${q._id}`);
                  setDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm font-semibold transition ${
                  i === currentIdx
                    ? "bg-[#810000] text-white"
                    : "hover:bg-[#f5eaea] text-[#810000]"
                }`}
              >
                {String(i + 1).padStart(3, "0")}
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
                `/question/mcq-single/${questions[currentIdx - 1]._id}`
              );
            }
          }}
          disabled={currentIdx === 0}
          className="rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          aria-label="Next"
          onClick={() => {
            if (currentIdx < questions.length - 1) {
              router.push(
                `/question/mcq-single/${questions[currentIdx + 1]._id}`
              );
            }
          }}
          disabled={currentIdx === questions.length - 1}
          className="rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40"
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

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[40vh] text-center">
        <div className="text-2xl font-semibold text-[#810000] mb-2">
          No Question Found
        </div>
        <div className="text-gray-600">
          Please try refreshing or contact support.
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* Centered Modal without overlay */}
      {showSubmissionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-[#810000] max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#810000] mb-4">
              {submitResult?.error ? "Submission Error" : "Submission Result"}
            </h3>

            {submissionTime && (
              <p className="mb-3">
                <span className="font-semibold">Time:</span>{" "}
                {submissionTime.toLocaleTimeString()} on{" "}
                {submissionTime.toLocaleDateString()}
              </p>
            )}

            {submitResult && (
              <div
                className={`mb-4 p-3 rounded ${
                  submitResult.error
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                <p>{submitResult.message}</p>
                {submitResult.correctAnswer && (
                  <p className="mt-2">
                    <strong>Correct Answer:</strong>{" "}
                    {submitResult.correctAnswer}
                  </p>
                )}
                {submitResult.explanation && (
                  <p className="mt-2">
                    <strong>Explanation:</strong> {submitResult.explanation}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 bg-[#810000] text-white rounded hover:bg-[#6a0000] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice & Single answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting the
        correct response. Only one response is correct.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading}
        </span>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">{formatTime(timeLeft)}</span>
        </span>
      </div>
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {currentQ.prompt}
      </div>
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        {currentQ.text}
      </div>
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options?.length > 0 ? (
          currentQ.options.map((opt, i) => {
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
                <span className="text-gray-800 font-normal text-base">
                  {opt}
                </span>
              </label>
            );
          })
        ) : (
          <div className="text-gray-500">
            No options found for this question.
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base disabled:opacity-50"
          onClick={() => {
            setSelected(null);
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
            setSubmitResult(null);
            setShowSubmissionModal(false);
          }}
          disabled={timeLeft === 0 || isSubmitting}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition disabled:opacity-50"
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
