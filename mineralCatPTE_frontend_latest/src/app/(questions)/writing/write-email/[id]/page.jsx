"use client";
import React, { use, useEffect, useState, useRef } from "react";
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
  Monitor,
  Share2,
  X,
  Award,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WRITING_SECONDS = 599; // 9:59min
const MIN_WORD_LIMIT = 30;
const IDEAL_MIN_WORD_LIMIT = 50;
const IDEAL_MAX_WORD_LIMIT = 120;
const MAX_WORD_LIMIT = 140;

const WRITE_EMAIL_RUBRIC = [
  {
    title: "Content",
    levels: [
      "3: Addresses the requirements of the task sufficiently and appropriately.",
      "2: Addresses the task with some success and demonstrates some understanding of the task.",
      "1: Attempts to address the task but is not successful; the task and/or topics may have been misunderstood.",
      "0: Does not properly deal with the task; the task and/or topics may have been largely misunderstood.",
    ],
  },
  {
    title: "Email Conventions",
    levels: [
      "2: Email conventions are obvious, appropriate, and used correctly in keeping with the format of the task.",
      "1: Email conventions are used inconsistently with elements missing and/or used ineffectively.",
      "0: Email conventions are limited or missing.",
    ],
  },
  {
    title: "Form",
    levels: [
      "2: Contains 50-120 words.",
      "1: Contains 30-49 words or 121-140 words.",
      "0: Contains fewer than 30 words or more than 140 words.",
    ],
  },
  {
    title: "Organization",
    levels: [
      "2: Organizational structure is clear and easy to follow. Ideas are presented logically and clearly organized. Transitions are used effectively.",
      "1: Organizational structure is generally acceptable and somewhat clear. Themes are grouped, but links may be unclear and transitions are mostly basic.",
      "0: Organizational structure is missing or not appropriate. Connections between ideas are unclear.",
    ],
  },
  {
    title: "Vocabulary",
    levels: [
      "2: Good command of lexis appropriate to the context of the given situation.",
      "1: Limited range of lexis. Some lexis is appropriate, but shortcomings lead to imprecision.",
      "0: Contains mainly basic vocabulary insufficient for the situation.",
    ],
  },
  {
    title: "Grammar",
    levels: [
      "2: Generally consistent grammatical control with only occasional errors.",
      "1: Fair degree of grammatical control; errors may be evident but do not cause undue effort.",
      "0: Contains mainly simple structures and/or frequent mistakes.",
    ],
  },
  {
    title: "Spelling",
    levels: [
      "2: Contains a maximum of two spelling/typing errors.",
      "1: Contains three or four spelling/typing errors.",
      "0: Contains numerous spelling/typing errors that may cause undue effort on the part of the reader.",
    ],
  },
];

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

  // Modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    // Limit word count to the supported scoring range ceiling
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

    setSubmitting(true);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/writing/write_email/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: id,
            answer: answer.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      const assessment = getQuestionAssessment(result, "write_email");
      const getTraitScore = (key) => getAssessmentTrait(assessment, key)?.score ?? 0;

      // Transform the API response to match the modal's expected format
      const transformedData = {
        overallScore: assessment?.score ?? 0,
        maxScore: assessment?.maxScore ?? 15,
        noFurtherScoring: Boolean(getAssessmentMeta(assessment, "noFurtherScoring", false)),
        gatingReason: getAssessmentMeta(assessment, "gatingReason", ""),
        enablingSkills: [
          {
            name: "Content",
            score: getTraitScore("content"),
            max: 3,
            progress: Math.round((getTraitScore("content") / 3) * 100),
            color: "hsl(var(--primary))",
          },
          {
            name: "Email Conventions",
            score: getTraitScore("emailConvention"),
            max: 2,
            progress: Math.round((getTraitScore("emailConvention") / 2) * 100),
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
            name: "Organization",
            score: getTraitScore("organization"),
            max: 2,
            progress: Math.round((getTraitScore("organization") / 2) * 100),
            color: "hsl(var(--primary))",
          },
          {
            name: "Vocabulary",
            score: getTraitScore("vocabularyRange"),
            max: 2,
            progress: Math.round((getTraitScore("vocabularyRange") / 2) * 100),
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
            name: "Spelling",
            score: getTraitScore("spelling"),
            max: 2,
            progress: Math.round((getTraitScore("spelling") / 2) * 100),
            color: "hsl(var(--primary))",
          },
        ],
        userResponse: {
          text: answer,
          totalWords: getAssessmentMeta(assessment, "wordCount", wordCount),
          time: formatTime(WRITING_SECONDS - writingTime),
          language: "English: American",
        },
        suggestions: [
          {
            title: "Feedback",
            text: assessment?.feedback || result.feedback,
          },
        ],
        scoreDisappearDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"), // 30 days from now
      };

      setResultData(transformedData);
      setShowResultModal(true);
    } catch (e) {
      alert(e.message || "Something went wrong! Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal and reset
  const closeModal = () => {
    setShowResultModal(false);
    setResultData(null);
    setAnswer("");
    setWordCount(0);
    setWritingTime(WRITING_SECONDS);
    setWritingStarted(false);
  };

  // mm:ss format for timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
        Write Email
      </div>
      <p className="text-gray-700 mb-6">
        Read the email task and write your response. You will have{" "}
        <span className="font-bold">9:59 minutes</span> to write your answer.{" "}
        <br />
        Target {IDEAL_MIN_WORD_LIMIT}-{IDEAL_MAX_WORD_LIMIT} words. The maximum supported length is {MAX_WORD_LIMIT} words.
      </p>
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        Email scoring starts with <span className="font-semibold">content</span>, then{" "}
        <span className="font-semibold">form</span>. If either content or form is `0`, there is no
        further scoring for email conventions, organization, vocabulary, grammar, or spelling.
      </div>

      <div className="mb-6 rounded-2xl border border-[#ead9d9] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#810000]">Scoring Guide</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            Write Email is scored on 7 traits. Content is scored first, then Form.
            If Content = 0 or Form = 0, there is no further scoring.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {WRITE_EMAIL_RUBRIC.map((trait) => (
            <div
              key={trait.title}
              className="rounded-2xl border border-[#efe5e5] bg-[#fffafa] p-4"
            >
              <h3 className="text-base font-semibold text-[#5d0000]">{trait.title}</h3>
              <div className="mt-3 space-y-2">
                {trait.levels.map((level) => (
                  <p
                    key={`${trait.title}-${level}`}
                    className="rounded-xl border border-[#f2ebeb] bg-white px-3 py-3 text-sm leading-6 text-gray-600"
                  >
                    {level}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

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
          disabled={writingTime === 0 || submitting}
        />
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <span className={`text-xs ${wordCount < MIN_WORD_LIMIT ? "text-orange-600" : "text-gray-500"}`}>
            {writingTime === 0
              ? "Time's up!"
              : wordCount < MIN_WORD_LIMIT
              ? `Responses under ${MIN_WORD_LIMIT} words receive Form = 0 and no further scoring.`
              : wordCount > IDEAL_MAX_WORD_LIMIT
              ? `Responses from 121-${MAX_WORD_LIMIT} words receive a reduced Form score of 1.`
              : wordCount < IDEAL_MIN_WORD_LIMIT || wordCount > IDEAL_MAX_WORD_LIMIT
              ? `Best scoring range: ${IDEAL_MIN_WORD_LIMIT}-${IDEAL_MAX_WORD_LIMIT} words.`
              : ""}
          </span>
          <span
            className={`text-xs font-semibold transition-all duration-200 ${
              wordCount > MAX_WORD_LIMIT
                ? "text-red-600"
                : wordCount > IDEAL_MAX_WORD_LIMIT
                ? "text-orange-600"
                : wordCount > IDEAL_MAX_WORD_LIMIT - 10
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
          className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-50"
          onClick={() => {
            setAnswer("");
            setWordCount(0);
            setWritingTime(WRITING_SECONDS);
            setWritingStarted(false);
          }}
          disabled={(writingTime === 0 && !answer) || submitting}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
          onClick={handleSubmit}
          disabled={
            !answer.trim() ||
            wordCount > MAX_WORD_LIMIT ||
            writingTime === 0 ||
            submitting
          }
        >
          <span>{submitting ? "Submitting..." : "Submit"}</span>
        </button>
      </div>

      {/* Custom AI Score Modal (Full Width) */}
      {showResultModal && resultData && (
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
                  onClick={closeModal}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-84px)] overflow-y-auto">
              <div className="p-12 space-y-12">
                {resultData.noFurtherScoring ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="mt-1 h-6 w-6 text-red-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-red-800">
                          No Further Scoring
                        </h3>
                        <p className="mt-3 text-base leading-7 text-red-700">
                          {resultData.gatingReason === "content"
                            ? "The response received 0 for content, so the task score is 0 and the remaining traits were not scored."
                            : "The response received 0 for form, so the task score is 0 and the remaining traits were not scored."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

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
                                (resultData.overallScore /
                                  resultData.maxScore) *
                                100
                              }, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-[#810000]">
                              {resultData.overallScore}
                            </span>
                            <span className="text-base text-gray-500">
                              out of {resultData.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-gray-700 mb-2">
                            {resultData.overallScore >=
                            resultData.maxScore * 0.8
                              ? "Excellent Work!"
                              : resultData.overallScore >=
                                resultData.maxScore * 0.6
                              ? "Good Job!"
                              : "Keep Practicing!"}
                          </p>
                          <p className="text-base text-gray-500">
                            {Math.round(
                              (resultData.overallScore / resultData.maxScore) *
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
                        {resultData.enablingSkills.map((skill, index) => (
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
                        {resultData.userResponse.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
                      <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-blue-600 font-bold uppercase tracking-wider mb-3">
                          Total Words
                        </p>
                        <p className="text-3xl font-bold text-blue-800">
                          {resultData.userResponse.totalWords}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-green-600 font-bold uppercase tracking-wider mb-3">
                          Time Taken
                        </p>
                        <p className="text-3xl font-bold text-green-800">
                          {resultData.userResponse.time}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-8 text-center border border-purple-200 hover:shadow-xl transition-shadow">
                        <p className="text-base text-purple-600 font-bold uppercase tracking-wider mb-3">
                          Language
                        </p>
                        <p className="text-xl font-bold text-purple-800">
                          {resultData.userResponse.language}
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-base text-gray-600 mt-8 bg-yellow-50 py-4 px-8 rounded-2xl border border-yellow-200">
                      ⏰ This score will expire on{" "}
                      <span className="font-bold">
                        {resultData.scoreDisappearDate}
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
                    {resultData.suggestions.map((suggestion, index) => (
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
    </div>
  );
}
