"use client";
import { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { getQuestionAssessment } from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";

const RECORD_SECONDS = 599;

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ResultModal({ isOpen, onClose, result }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-200 overflow-hidden transform transition-all animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-[#810000] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.score >= 70 ? (
                <CheckCircle className="h-6 w-6 text-green-300" />
              ) : (
                <XCircle className="h-6 w-6 text-red-300" />
              )}
              <h3 className="text-lg font-bold">Result</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#810000] text-white text-xl font-bold mb-3">
              {result.score}%
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-700">{result.message}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 border-l-3 border-blue-400">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">
                Your Answer
              </h4>
              <div className="text-xs text-blue-800 space-y-1">
                {result.userAnswer.map((item, i) => (
                  <div key={i} className="flex">
                    <span className="font-medium mr-2">{i + 1}.</span>
                    <span className="flex-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border-l-3 border-green-400">
              <h4 className="font-medium text-green-900 mb-2 text-sm">
                Correct Answer
              </h4>
              <div className="text-xs text-green-800 space-y-1">
                {result.correctAnswer.map((item, i) => (
                  <div key={i} className="flex">
                    <span className="font-medium mr-2">{i + 1}.</span>
                    <span className="flex-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#810000] text-white rounded-lg hover:bg-[#6a0000] transition font-medium text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState({
    score: 0,
    message: "",
    userAnswer: [],
    correctAnswer: [],
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        let arr = [];
        let idx = 0;
        let questionObj = null;

        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          arr = data.questions;
          idx = arr.findIndex((q) => q._id === id);
          questionObj = arr[idx !== -1 ? idx : 0];
        } else if (data?.question) {
          arr = [data.question];
          idx = 0;
          questionObj = data.question;
        }

        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);

        const optionsArr = questionObj?.options || [];
        const shuffled = shuffle(
          optionsArr.map((text, i) => ({
            label: String.fromCharCode(97 + i).toUpperCase(),
            text,
            idx: i,
          }))
        );
        setSource(shuffled);
        setTarget([]);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setSource([]);
        setTarget([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }

    getQuestions();
  }, [id, baseUrl]);

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

  const handleDragStart = (item, fromSource, idx) => {
    setDragged({ ...item, fromSource, idx });
  };

  const handleDropTarget = () => {
    if (dragged && dragged.fromSource) {
      setTarget((prev) => [
        ...prev,
        {
          ...dragged,
          label: String.fromCharCode(97 + prev.length).toUpperCase(),
        },
      ]);
      setSource((prev) => prev.filter((_, i) => i !== dragged.idx));
    }
    setDragged(null);
  };

  const handleDropSource = () => {
    if (dragged && !dragged.fromSource) {
      setSource((prev) => [...prev, dragged]);
      setTarget((prev) => prev.filter((_, i) => i !== dragged.idx));
    }
    setDragged(null);
  };

  const handleDragOverTarget = (overIdx) => {
    if (!dragged || !!dragged.fromSource) return;
    setTarget((prev) => {
      const arr = prev.slice();
      arr.splice(dragged.idx, 1);
      arr.splice(overIdx, 0, dragged);
      return arr.map((item, i) => ({
        ...item,
        label: String.fromCharCode(97 + i).toUpperCase(),
      }));
    });
    setDragged((d) => ({ ...d, idx: overIdx }));
  };

  const handleSubmit = async () => {
    if (!currentQ || target.length !== (currentQ.options?.length || 0)) {
      return;
    }

    setIsSubmitting(true);
    // Remove this line: setShowResultModal(true)

    const payload = {
      questionId: currentQ._id,
      answer: target.map((item) => item.text),
    };

    try {
      const res = await fetchWithAuth(
        `${baseUrl}/test/reading/reorder-paragraphs/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const resultData = await res.json();
      const assessment = getQuestionAssessment(resultData, "reorder_paragraphs");
      setResult({
        score: assessment?.percentage ?? 0,
        message: resultData.message || "",
        userAnswer: target.map((item) => item.text),
        correctAnswer: resultData.correctAnswer || currentQ.options || [],
      });

      // Add this line to show modal only after getting result
      setShowResultModal(true);
    } catch (error) {
      console.error("Submission error:", error);
      setResult({
        score: 0,
        message: "Failed to submit answer. Please try again.",
        userAnswer: target.map((item) => item.text),
        correctAnswer: currentQ.options || [],
      });

      // Add this line to show modal even on error
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    if (!currentQ) return;
    const optionsArr = currentQ.options || [];
    const shuffled = shuffle(
      optionsArr.map((text, i) => ({
        label: String.fromCharCode(97 + i).toUpperCase(),
        text,
        idx: i,
      }))
    );
    setSource(shuffled);
    setTarget([]);
    setTimeLeft(RECORD_SECONDS);
    setTimerStarted(false);
    setShowResultModal(false);
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
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/reorder-paragraphs/${q._id}`);
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
                `/question/reorder-paragraphs/${questions[currentIdx - 1]._id}`
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
                `/question/reorder-paragraphs/${questions[currentIdx + 1]._id}`
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#810000]"></div>
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
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Re-order Paragraphs
      </div>

      <p className="text-gray-700 mb-6">{currentQ.prompt}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading || ""}
        </span>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">{formatTime(timeLeft)}</span>
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full justify-center mb-5">
        <div className="flex-1 min-w-[260px] max-w-[50%]">
          <div className="bg-[#810000] text-white text-center rounded-t px-2 py-2 font-semibold">
            Source
          </div>
          <div
            className="border border-[#810000] border-t-0 rounded-b min-h-[320px] pb-2 pt-2 bg-white flex flex-col gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropSource}
          >
            {source.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                No items left
              </div>
            )}
            {source.map((item, i) => (
              <div
                key={item.label + item.idx}
                className="flex items-center gap-3 bg-[#faf9f9] border border-[#810000] rounded px-4 py-3 cursor-grab select-none shadow-sm"
                draggable
                onDragStart={() => handleDragStart(item, true, i)}
                style={{
                  opacity:
                    dragged &&
                    dragged.label === item.label &&
                    dragged.fromSource
                      ? 0.4
                      : 1,
                }}
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#810000] bg-white text-[#810000] font-bold">
                  {item.label}
                </span>
                <span className="flex-1 text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-1 py-1">
          <span className="text-[#810000] text-3xl font-bold">{">>"}</span>
        </div>

        <div className="flex-1 min-w-[260px] max-w-[50%]">
          <div className="bg-[#810000] text-white text-center rounded-t px-2 py-2 font-semibold">
            Target
          </div>
          <div
            className="border border-[#810000] border-t-0 rounded-b min-h-[320px] pb-2 pt-2 bg-white flex flex-col gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropTarget}
          >
            {target.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                Drag paragraphs here
              </div>
            )}
            {target.map((item, i) => (
              <div
                key={item.label + item.idx}
                className="flex items-center gap-3 bg-[#faf9f9] border border-[#810000] rounded px-4 py-3 cursor-grab select-none shadow-sm"
                draggable
                onDragStart={() => handleDragStart(item, false, i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOverTarget(i);
                }}
                style={{
                  opacity:
                    dragged &&
                    dragged.label === item.label &&
                    !dragged.fromSource
                      ? 0.4
                      : 1,
                }}
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#810000] bg-white text-[#810000] font-bold">
                  {item.label}
                </span>
                <span className="flex-1 text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base disabled:opacity-50"
          onClick={handleRestart}
          disabled={timeLeft === 0 || isSubmitting}
        >
          Restart
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded border-2 border-[#810000] font-semibold text-base transition min-w-[140px] ${
            isSubmitting
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white text-[#810000] hover:bg-[#810000] hover:text-white"
          }`}
          onClick={handleSubmit}
          disabled={
            target.length !== (currentQ.options?.length || 0) ||
            timeLeft === 0 ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
      />

      {renderPagination()}
    </div>
  );
}
