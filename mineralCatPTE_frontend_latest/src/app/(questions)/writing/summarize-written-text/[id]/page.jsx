"use client";
import React, { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { getAssessmentTrait, getQuestionAssessment } from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Monitor,
  Share2,
  X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WRITING_SECONDS = 599; // 9:59min
const MIN_WORD_LIMIT = 25;
const MAX_WORD_LIMIT = 50;

export default function RepeatSentencePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Writing timer
  const [writingTime, setWritingTime] = useState(WRITING_SECONDS);
  const [writingStarted, setWritingStarted] = useState(false);
  const timerRef = useRef();

  // Answer state
  const [answer, setAnswer] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Pagination dropdown (not used but kept for future)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Fetch question
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
      setWritingTime(WRITING_SECONDS);
      setWritingStarted(false);
      setAnswer("");
      setWordCount(0);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Writing timer logic
  useEffect(() => {
    if (!writingStarted) return;
    if (writingTime === 0) {
      setWritingStarted(false);
      return;
    }
    timerRef.current = setTimeout(() => setWritingTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [writingStarted, writingTime]);

  // Word count
  useEffect(() => {
    const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [answer]);

  // Prevent paste in textarea
  const handlePaste = (e) => {
    e.preventDefault();
  };

  // Handle input in textarea
  const handleInput = (e) => {
    if (!writingStarted) setWritingStarted(true);
    let val = e.target.value;
    // Limit word count to the official max range
    let words = val.trim() ? val.trim().split(/\s+/) : [];
    if (words.length > MAX_WORD_LIMIT) {
      words = words.slice(0, MAX_WORD_LIMIT);
      val = words.join(" ") + " ";
    }
    setAnswer(val);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!answer.trim() || !question) return;

    const userSummary = answer.trim();
    const questionId = id;

    setScoreLoading(true);
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/writing/summerize-written-text/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: userSummary,
            questionId,
          }),
        }
      );

      const data = await response.json();
      const assessment = getQuestionAssessment(data, "summarize_written_text");
      const getTraitScore = (key) => getAssessmentTrait(assessment, key)?.score ?? 0;
      setScoreData({
        overallScore: assessment?.score ?? 0,
        maxScore: assessment?.maxScore ?? 8,
        enablingSkills: [
          {
            name: "Content",
            score: getTraitScore("content"),
            max: 2,
            progress: Math.round((getTraitScore("content") / 2) * 100),
            color: "hsl(var(--primary))",
          },
          {
            name: "Form",
            score: getTraitScore("form"),
            max: 2,
            progress: Math.round((getTraitScore("form") / 2) * 100),
            color: "hsl(var(--primary))",
          },
          {
            name: "Grammar",
            score: getTraitScore("grammar"),
            max: 2,
            progress: Math.round((getTraitScore("grammar") / 2) * 100),
            color: "hsl(var(--primary))",
          },
          {
            name: "Vocabulary",
            score: getTraitScore("vocabularyRange"),
            max: 2,
            progress: Math.round((getTraitScore("vocabularyRange") / 2) * 100),
            color: "hsl(var(--primary))",
          },
        ],
        userResponse: {
          text: answer,
          totalWords: wordCount,
          time: formatTime(WRITING_SECONDS - writingTime),
          language: "English: American", // You can modify this if you have language data
        },
        suggestions: [
          {
            title: "Feedback",
            text: assessment?.feedback || data.feedback,
          },
        ],
        scoreDisappearDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"), // 30 days from now
      });

      setShowAiScoreModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
    } finally {
      setScoreLoading(false);
    }
  };

  // mm:ss format for timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Summarize Written Text
      </div>
      <p className="text-gray-700 mb-6">
        Read the passage and write a summary of it. You will have{" "}
        <span className="font-bold">9:59 minutes</span> to write your answer.{" "}
        <br />
        Keep your summary between {MIN_WORD_LIMIT} and {MAX_WORD_LIMIT} words.
      </p>
      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex flex-wrap md:flex-nowrap items-center gap-2">
        <span>#{question._id}</span>
        <span>|</span>
        <span>{question.heading}</span>
      </div>
      {/* Timer */}
      <div className="mb-2 text-[#810000] font-medium text-base flex items-center gap-2">
        <svg
          width="21"
          height="21"
          fill="#810000"
          className="inline"
          viewBox="0 0 24 24"
        >
          <path d="M12 7v5l4 2M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z" />
        </svg>
        <span className="font-bold text-lg">{formatTime(writingTime)}</span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {renderPromptText(question.prompt)}
      </div>
      {/* Writing Box */}
      <div className="border border-[#810000] rounded p-0 mb-3 bg-[#faf9f9] flex flex-col items-stretch relative">
        <textarea
          className="w-full min-h-[210px] max-h-[420px] p-4 rounded text-base border-0 outline-none resize-none bg-[#faf9f9] text-gray-800 font-mono"
          placeholder="Type your answer here (Paste is disabled)..."
          value={answer}
          onChange={handleInput}
          onPaste={handlePaste}
          maxLength={MAX_WORD_LIMIT * 12}
          disabled={writingTime === 0}
        />
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <span className={`text-xs ${wordCount < MIN_WORD_LIMIT ? "text-orange-600" : "text-gray-500"}`}>
            {writingTime === 0 ? "Time's up!" : wordCount < MIN_WORD_LIMIT ? `Write at least ${MIN_WORD_LIMIT} words.` : ""}
          </span>
          <span
            className={`text-xs font-semibold transition-all duration-200 ${
              wordCount > MAX_WORD_LIMIT
                ? "text-red-600"
                : wordCount > MAX_WORD_LIMIT - 10
                ? "text-orange-600"
                : "text-gray-700"
            }`}
          >
            Words: {wordCount} / {MAX_WORD_LIMIT}
          </span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2">
        <button
          className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm"
          onClick={() => {
            setAnswer("");
            setWordCount(0);
            setWritingTime(WRITING_SECONDS);
            setWritingStarted(false);
          }}
          disabled={writingTime === 0 && !answer}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
          onClick={handleSubmit}
          disabled={
            !answer.trim() ||
            wordCount < MIN_WORD_LIMIT ||
            wordCount > MAX_WORD_LIMIT ||
            writingTime === 0 ||
            scoreLoading
          }
        >
          {scoreLoading ? "Submitting..." : "Submit"}
        </button>
      </div>

      <style jsx>{`
        textarea::placeholder {
          color: #bbb;
        }
        textarea:disabled {
          background: #f5f5f5;
          color: #aaa;
        }
        .word:hover {
          color: #810000 !important;
        }
      `}</style>

      {/* Custom AI Score Modal (Full Width) */}
      {showAiScoreModal && scoreData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 shadow-lg">
              {/* Left Section */}
              <div className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>#{question._id}</span>
              </div>

              {/* Center Title */}
              <div className="text-white text-xl sm:text-2xl font-bold text-center flex flex-col sm:flex-grow sm:items-center">
                AI Score Report
                <span className="block text-sm font-normal opacity-90 mt-1">
                  alfapte.com
                </span>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
                <X
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowAiScoreModal(false)}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-84px)] overflow-y-auto">
              <div className="p-12 space-y-12">
                {/* Score Overview */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
                  {/* Overall Score */}
                  <div className="xl:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-10 text-center">
                        Overall Score
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 mb-6">
                          <svg
                            className="w-40 h-40 transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#810000"
                              strokeWidth="2"
                              strokeDasharray={`${
                                (scoreData.overallScore / scoreData.maxScore) *
                                100
                              }, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-[#810000]">
                              {scoreData.overallScore}
                            </span>
                            <span className="text-base text-gray-500">
                              out of {scoreData.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-gray-700 mb-2">
                            {scoreData.overallScore >= scoreData.maxScore * 0.8
                              ? "Excellent Work!"
                              : scoreData.overallScore >=
                                scoreData.maxScore * 0.6
                              ? "Good Job!"
                              : "Keep Practicing!"}
                          </p>
                          <p className="text-base text-gray-500">
                            {Math.round(
                              (scoreData.overallScore / scoreData.maxScore) *
                                100
                            )}
                            % Achievement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="xl:col-span-4">
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-5 px-10 rounded-2xl mb-10">
                        <h3 className="text-2xl font-bold text-center">
                          Enabling Skills Breakdown
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {scoreData.enablingSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <span className="font-bold text-gray-800 text-xl">
                                {skill.name}
                              </span>
                              <span className="text-xl font-bold text-[#810000] bg-red-50 px-4 py-2 rounded-full">
                                {skill.score}/{skill.max}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={skill.progress}
                                className="h-5 bg-slate-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-white drop-shadow-sm">
                                  {skill.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Response Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-6 px-10">
                    <h3 className="text-3xl font-bold">
                      Your Response Analysis
                    </h3>
                  </div>

                  <div className="p-10 space-y-8">
                    <div className="bg-slate-50 rounded-2xl p-8 border-l-8 border-[#810000]">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line text-xl">
                        {scoreData.userResponse.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
                      <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-blue-600 font-bold uppercase tracking-wider mb-3">
                          Total Words
                        </p>
                        <p className="text-3xl font-bold text-blue-800">
                          {scoreData.userResponse.totalWords}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-green-600 font-bold uppercase tracking-wider mb-3">
                          Time Taken
                        </p>
                        <p className="text-3xl font-bold text-green-800">
                          {scoreData.userResponse.time}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-purple-600 font-bold uppercase tracking-wider mb-3">
                          Language
                        </p>
                        <p className="text-xl font-bold text-purple-800">
                          {scoreData.userResponse.language}
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-base text-gray-600 mt-8 bg-yellow-50 py-4 px-8 rounded-2xl border border-yellow-200">
                      ⏰ This score will expire on{" "}
                      <span className="font-bold">
                        {scoreData.scoreDisappearDate}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-6 px-10 cursor-pointer hover:from-[#950000] hover:to-[#b50000] transition-colors">
                    <h3 className="text-3xl font-bold flex items-center justify-center gap-4">
                      💡 Detailed Feedback & Suggestions
                    </h3>
                  </div>
                  <div className="p-10 bg-gradient-to-br from-slate-50 to-white">
                    {scoreData.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-8 last:mb-0">
                        <div className="bg-white rounded-2xl p-8 border-l-8 border-[#810000] shadow-lg hover:shadow-xl transition-shadow">
                          <h4 className="font-bold text-[#810000] mb-4 flex items-center gap-4 text-2xl">
                            <span className="w-4 h-4 bg-[#810000] rounded-full"></span>
                            {suggestion.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-lg">
                            {suggestion.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
