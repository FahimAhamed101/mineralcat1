"use client";
import { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentSkill,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Volume2,
  Clock,
  Target,
} from "lucide-react";
import MicRecorder from "mic-recorder-to-mp3";

const RECORD_SECONDS = 35;

function ResultModal({ isOpen, onClose, result }) {
  if (!isOpen) return null;

  const assessment = getQuestionAssessment(result, "read_aloud");
  const speakingScore = getAssessmentSkill(assessment, "speaking")?.score ?? 0;
  const readingScore = getAssessmentSkill(assessment, "reading")?.score ?? 0;
  const contentScore = getAssessmentTrait(assessment, "content")?.score ?? 0;
  const fluencyScore = getAssessmentTrait(assessment, "fluency")?.score ?? 0;
  const pronunciationScore =
    getAssessmentTrait(assessment, "pronunciation")?.score ?? 0;
  const goodWords = getAssessmentMeta(assessment, "goodWords", 0);
  const averageWords = getAssessmentMeta(assessment, "averageWords", 0);
  const badWords = getAssessmentMeta(assessment, "badWords", 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 overflow-hidden transform transition-all animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-[#810000] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-300" />
              ) : (
                <XCircle className="h-6 w-6 text-red-300" />
              )}
              <h3 className="text-lg font-bold">Speaking Assessment Result</h3>
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
          {result.success ? (
            <>
              {/* Main Scores */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900 text-sm">
                      Speaking Score
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {Number(speakingScore).toFixed(1)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-900 text-sm">
                      Reading Score
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {Number(readingScore).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3 mb-4">
                <div className="bg-purple-50 rounded-lg p-3 border-l-3 border-purple-400">
                  <h4 className="font-medium text-purple-900 mb-2 text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Content:</span>
                      <span className="font-medium text-purple-800">
                        {contentScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Fluency:</span>
                      <span className="font-medium text-purple-800">
                        {fluencyScore}%
                      </span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-purple-700">Pronunciation:</span>
                      <span className="font-medium text-purple-800">
                        {Number(pronunciationScore).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border-l-3 border-orange-400">
                  <h4 className="font-medium text-orange-900 mb-2 text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Word Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-lg">
                        {goodWords}
                      </div>
                      <div className="text-green-700">Good</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-bold text-lg">
                        {averageWords}
                      </div>
                      <div className="text-yellow-700">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-bold text-lg">
                        {badWords}
                      </div>
                      <div className="text-red-700">Needs Work</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-red-500 text-lg font-medium mb-2">
                Assessment Failed
              </div>
              <p className="text-gray-600 text-sm">
                Unable to process your recording. Please try again.
              </p>
            </div>
          )}

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
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  const recorder = useRef(null);
  const timerRef = useRef();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState({
    success: false,
    data: null,
  });

  // Fetch question
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch (error) {
        console.error("Failed to fetch question:", error);
        setQuestion(null);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setAudioBlob(null);
      setIsRecording(false);
    }
    getQuestion();
  }, [id, baseUrl]);

  // Timer logic
  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) {
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  // Start recording
  const startRecording = () => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
        setTimeLeft(RECORD_SECONDS);
      })
      .catch((e) => console.error("Recording failed:", e));
  };

  // Stop recording
  const stopRecording = () => {
    if (!recorder.current) return;

    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
      })
      .catch((e) => console.error("Stopping recording failed:", e));
  };

  // Submit recording
  const handleSubmit = async () => {
    if (!audioBlob || !question) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);

    try {
      const res = await fetchWithAuth(
        `${baseUrl}/test/speaking/read_aloud/result`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const resultData = await res.json();
      console.log("📤 Full API Response:", resultData);
      console.log("📊 Response Data:", resultData.data);
      console.log("✅ Success Status:", resultData.success);
      setResult(resultData);
      setShowResultModal(true);
    } catch (error) {
      console.error("❌ Submission Error Details:", error);
      console.error("❌ Error Message:", error.message);
      setResult({
        success: false,
        data: null,
      });
      setShowResultModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#810000]"></div>
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Read Aloud
      </div>

      <p className="text-gray-700 mb-6">
        Look at the text below. In 35 seconds, you must read this text aloud as
        naturally and clearly as possible. You have 35 seconds to read aloud.
      </p>

      {/* Question Info */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{question._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {question.heading}
        </span>
      </div>

      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          {isRecording ? "Recording:" : "Beginning in"}
          <span className="font-bold ml-1">{timeLeft} sec</span>
        </span>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {question.prompt}
      </div>

      {/* Recorder UI */}
      <div className="border border-[#810000] rounded p-4 mb-6 bg-[#faf9f9] flex flex-col items-center">
        <div className="flex items-center w-full gap-2 mt-2">
          <span className="text-xs text-gray-600">
            {new Date((RECORD_SECONDS - timeLeft) * 1000)
              .toISOString()
              .substr(14, 5)}
          </span>
          <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden relative">
            <div
              className="h-2 rounded bg-[#810000] transition-all duration-200"
              style={{
                width: `${
                  ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100
                }%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {new Date(RECORD_SECONDS * 1000).toISOString().substr(14, 5)}
          </span>
        </div>

        <div className="mt-2 text-center w-full text-gray-500 font-medium">
          {isRecording
            ? "Recording... Speak now"
            : audioBlob
            ? "Recording complete"
            : "Click Start to record"}
        </div>

        {/* Audio Preview */}
        {mp3URL && (
          <div className="mt-3">
            <audio controls className="w-full max-w-xs">
              <source src={mp3URL} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            className="px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-50"
            onClick={() => {
              setAudioBlob(null);
              setMp3URL(null);
              setTimeLeft(RECORD_SECONDS);
              setIsRecording(false);
            }}
            disabled={isRecording || isSubmitting}
          >
            Restart
          </button>

          <button
            className={`px-4 py-1 rounded font-medium text-sm transition min-w-[80px] ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#810000] text-white hover:bg-[#5d0000]"
            }`}
            onClick={handleSubmit}
            disabled={!audioBlob || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>

          <button
            className="px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={() => {
              if (!isRecording && timeLeft > 0) {
                setTimeLeft(RECORD_SECONDS);
                setAudioBlob(null);
                setMp3URL(null);
                startRecording();
              }
            }}
            disabled={isRecording || timeLeft === 0 || isSubmitting}
          >
            Start
          </button>

          <button
            className="px-4 py-1 rounded bg-gray-500 text-white font-medium text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-400"
            onClick={stopRecording}
            disabled={!isRecording || isSubmitting}
          >
            Stop
          </button>
        </div>
      </div>

      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
      />
    </div>
  );
}
