"use client";
import { use, useEffect, useState } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import AudioPlayer from "./../../../../../components/audio/AudioPlayer";
import { Progress } from "@/components/ui/progress";

// Card components (if not available from shadcn/ui, create simple versions)
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export default function DynamicPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [summary, setSummary] = useState(""); // Textarea value
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("Submission Status", isSubmitting);

  const [serverResponse, setServerResponse] = useState({}); // server response for submission

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  //==================Modal States======================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  // Fetch listening questions, support both array and single object
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        // Handle array: { questions: [...] }
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
        }
        // Handle single: { question: {...} }
        else if (data?.question) {
          setQuestions([data.question]);
          setCurrentQ(data.question);
          setCurrentIdx(0);
        } else {
          setQuestions([]);
          setCurrentQ(null);
          setCurrentIdx(0);
        }
      } catch {
        setQuestions([]);
        setCurrentQ(null);
        setCurrentIdx(0);
      }
      setLoading(false);
      setSummary(""); // reset summary when loading new question
    }
    getQuestions();
    // eslint-disable-next-line
  }, [id]);

  // Pagination
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/summarize-spoken-text/${questions[idx]._id}`);
    setDropdownOpen(false);
  };

  const renderPagination = () => (
    <div className="pagination-sticky">
      <div className="flex items-center gap-2">
        <button
          aria-label="Prev"
          onClick={() => goToIndex(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            className="rounded border border-[#810000] bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
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
            <div className="absolute left-0 bottom-12 w-44 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
              {questions.slice(0, 100).map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => goToIndex(i)}
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
        <button
          aria-label="Next"
          onClick={() => goToIndex(currentIdx + 1)}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .pagination-sticky {
          position: fixed;
          right: 2.5rem;
          bottom: 2.5rem;
          z-index: 50;
          background: transparent;
        }
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

  // Submit handler
  const handleSubmit = async () => {
    if (!summary.trim() || !currentQ || !currentQ._id || wordCount < 20 || wordCount > 30) {
      return;
    }

    const payload = {
      questionId: currentQ._id,
      answer: summary.trim(),
    };

    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth(
        `${baseUrl}/test/listening/summarize-spoken-text/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      setServerResponse(result);

      if (!response.ok) {
        console.error("❌ Server responded with error:", result);
        return;
      }

      setSummary("");
      setIsModalOpen(true);
      console.log("✅ Server response:", result);
    } catch (e) {
      console.error("🔥 Submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* =========================Modal Contents starts here=============== */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleCloseModal}
        onClose={handleCloseModal}
        serverResponse={serverResponse}
      />
      {/* =========================Modal Contents ends here=============== */}

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Summarize Spoken Text
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the recording and write a summary. Keep your summary between
        20 and 30 words.
      </p>

      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex flex-wrap md:flex-nowrap items-center gap-2">
        <span>#{currentQ._id}</span>
        <span>|</span>
        <span>{currentQ.heading}</span>
      </div>

      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        <AudioPlayer src={currentQ.audioUrl} />
      </div>

      {/* Textarea for summary */}
      <div className="border border-[#810000] rounded p-4 mb-6 bg-[#faf9f9] flex flex-col items-start">
        <label htmlFor="summary" className="text-[#810000] font-semibold mb-2">
          Write your summary here
        </label>
        <textarea
          id="summary"
          rows={7}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 font-mono text-base"
          placeholder="Write a 20-30 word summary..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={isSubmitting}
        />
        <p className={`mb-3 text-sm ${wordCount < 20 || wordCount > 30 ? "text-orange-600" : "text-gray-600"}`}>
          Words: {wordCount}. Target range: 20-30 words.
        </p>
        <button
          className="px-5 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition disabled:bg-[#810000] disabled:text-white disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!summary.trim() || wordCount < 20 || wordCount > 30 || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      {renderPagination()}
    </div>
  );
}

//Modal Component
const Modal = ({ isModalOpen, setIsModalOpen, onClose, serverResponse }) => {
  const assessment = getQuestionAssessment(serverResponse, "summarize_spoken_text");
  const getTraitScore = (key) => getAssessmentTrait(assessment, key)?.score ?? 0;
  const assessmentFeedback = getAssessmentMeta(assessment, "feedback", {});
  const originalTranscript = getAssessmentMeta(assessment, "originalTranscript", "");
  const userSummary = getAssessmentMeta(assessment, "userSummary", "");
  const wordCountValue = getAssessmentMeta(assessment, "wordCount", 0);

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

  return (
    <div
      onClick={setIsModalOpen}
      className="h-dvh w-full fixed inset-0 z-50 bg-black/50 flex flex-col justify-center items-center"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Card className="w-[90vw] sm:w-[600px] md:w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-500 mx-auto mb-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#810000] mb-2">
                🎉 Results
              </h2>
              <p className="text-sm text-gray-600">
                Here's your summary analysis
              </p>
            </div>

            <div className="space-y-4">
              {/* Original Transcript and User Summary */}
              <div className="grid gap-3">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">
                    Original Transcript
                  </h3>
                  <p className="text-blue-700 text-sm">
                  {originalTranscript || "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 text-sm">
                    Your Summary
                  </h3>
                  <p className="text-green-700 text-sm">
                  {userSummary || "N/A"}
                  </p>
                </div>
              </div>

              {/* Summarize Text Scores */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                  Summarize Text Score
                </h3>

                {/* Individual Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs font-medium text-gray-600">Content</p>
                    <p className="text-lg font-bold text-purple-600">
                    {getTraitScore("content")}
                    /2
                    </p>
                    <Progress
                      value={
                      getTraitScore("content") * 50
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs font-medium text-gray-600">Form</p>
                    <p className="text-lg font-bold text-orange-600">
                    {getTraitScore("form")}
                    /2
                    </p>
                    <Progress
                      value={
                      getTraitScore("form") * 50
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs font-medium text-gray-600">Grammar</p>
                    <p className="text-lg font-bold text-pink-600">
                    {getTraitScore("grammar")}
                    /2
                    </p>
                    <Progress
                      value={
                      getTraitScore("grammar") * 50
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="text-xs font-medium text-gray-600">
                      Spelling
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                    {getTraitScore("spelling")}
                    /2
                    </p>
                    <Progress
                      value={
                      getTraitScore("spelling") * 50
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="bg-white p-2 rounded text-center sm:col-span-2 lg:col-span-1">
                    <p className="text-xs font-medium text-gray-600">
                      Vocabulary Range
                    </p>
                    <p className="text-lg font-bold text-teal-600">
                    {getTraitScore("vocabulary_range")}
                    /2
                    </p>
                    <Progress
                      value={
                      getTraitScore("vocabulary_range") * 50
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Total Score */}
                <div className="bg-[#810000] text-white p-3 rounded-lg mb-3">
                  <p className="text-sm opacity-90">Total Score</p>
                  <p className="text-2xl font-bold">
                  {assessment?.score ?? 0}/10
                </p>
                <Progress
                  value={(assessment?.score ?? 0) * 10}
                  className="h-3 bg-white/20"
                />
                </div>

                {/* Word Count */}
                <div className="text-center text-sm text-gray-600 mb-4">
                  Word Count:{" "}
                  <span className="font-semibold">
                    {wordCountValue}
                  </span>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                  Feedback
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                    <h4 className="font-medium text-green-800">Strengths</h4>
                    <p className="text-green-700 text-sm">
                    {assessmentFeedback?.strengths || "N/A"}
                    </p>
                  </div>
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                    <h4 className="font-medium text-yellow-800">
                      Improvements
                    </h4>
                    <p className="text-yellow-700 text-sm">
                    {assessmentFeedback?.improvements || "N/A"}
                    </p>
                  </div>
                  <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                    <h4 className="font-medium text-blue-800">Overall</h4>
                    <p className="text-blue-700 text-sm">
                    {assessmentFeedback?.overall || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Quality */}
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-3 text-lg">
                  Summary Quality
                </h3>
                <div className="mb-3">
                  <p className="text-sm text-indigo-700 mb-1">
                    Quality Score:{" "}
                    <span className="font-bold">
                      {serverResponse?.summary?.summary_quality_score || 0}/10
                    </span>
                  </p>
                  <Progress
                    value={
                      (serverResponse?.summary?.summary_quality_score || 0) * 10
                    }
                    className="h-3"
                  />
                </div>
                <div className="bg-white p-3 rounded">
                  <h4 className="font-medium text-indigo-800 mb-2">
                    Writing Ability
                  </h4>
                  <p className="text-indigo-700 text-sm mb-2">
                    {serverResponse?.summary?.combined_assessment
                      ?.summary_writing_ability || "N/A"}
                  </p>
                  <Progress value={90} className="h-2" />
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-2 bg-[#810000] text-white rounded hover:bg-[#5d0000] font-medium text-sm"
              >
                Close
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
