"use client";
import React, { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentSkill,
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
// import AudioPlayer from "../../../../../components/audio/AudioPlayer";
import MicRecorder from "mic-recorder-to-mp3";

// Constants
const RECORD_SECONDS = 15;

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

function getRepeatSentenceResultData(serverResponse) {
  const assessment = getQuestionAssessment(serverResponse, "repeat_sentence");

  return {
    speakingScore: getAssessmentSkill(assessment, "speaking")?.score ?? null,
    listeningScore: getAssessmentSkill(assessment, "listening")?.score ?? null,
    fluency: getAssessmentTrait(assessment, "fluency")?.score ?? null,
    content: getAssessmentTrait(assessment, "content")?.score ?? null,
    pronunciation: getAssessmentTrait(assessment, "pronunciation")?.score ?? null,
    totalWords: getAssessmentMeta(assessment, "totalWords", 0),
    goodWords: getAssessmentMeta(assessment, "goodWords", 0),
    averageWords: getAssessmentMeta(assessment, "averageWords", 0),
    badWords: getAssessmentMeta(assessment, "badWords", 0),
  };
}

export default function RepeatSentencePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("SERVER RESPONSE===============>", serverResponse);
  //=============Modal State==========================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Timers
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef();

  // Audio player
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef();

  // Mic Recorder instance (MUST be initialized in useEffect or on first use)
  const recorder = useRef(null);

  // Recorder initialization
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  // Fetch the question
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
      setTimeLeft(RECORD_SECONDS);
      setAudioBlob(null);
      setIsRecording(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Answer timer logic
  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) {
      setIsRecording(false);
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  // Audio play handler
  const handleAudioPlay = () => {
    setAudioPlaying(true);
  };
  const handleAudioEnded = () => {
    setAudioPlaying(false);
  };

  // Start recording function
  const startRecording = async () => {
    try {
      if (!recorder.current) {
        recorder.current = new MicRecorder({ bitRate: 128 });
      }
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch (err) {
      setIsRecording(false);
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    if (recorder.current) {
      try {
        const [buffer, blob] = await recorder.current.stop().getMp3();
        setAudioBlob(blob);
        setIsRecording(false);
      } catch {
        setAudioBlob(null);
        setIsRecording(false);
      }
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!audioBlob || !question) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/speaking/repeat_sentence/result`,
        {
          method: "POST",
          body: formData,
        }
      );
      setServerResponse(await response.json());
      setIsModalOpen(true);
    } catch (e) {
      console.error("Submission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      {/* =========================Modal Contents starts here=============== */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleCloseModal}
        onClose={handleCloseModal}
        serverResponse={serverResponse}
      />
      {/* =========================Modal Contents ends here=============== */}

      {/* Title/Heading */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        {question.heading}
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the sentence and repeat it. You will have {RECORD_SECONDS}
        seconds to record your response. <br />
        Repeat the sentence as accurately as possible.
      </p>

      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
        {question.audioUrl && (
          <audio
            ref={audioRef}
            src={question.audioUrl}
            onPlay={handleAudioPlay}
            onEnded={handleAudioEnded}
            controls
            style={{ width: "100%" }}
          />
        )}
      </div>

      {/* Prompt */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {question.prompt}
      </div>

      {/* Audio Recorder */}
      <div className="border border-[#810000] rounded p-4 mb-6 bg-[#faf9f9] flex flex-col items-center">
        <div>
          {isRecording ? (
            <div>Recording... Speak now</div>
          ) : (
            <div>Click Start to record</div>
          )}
        </div>
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

        {/* Controls */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm"
            onClick={() => {
              setAudioBlob(null);
              setTimeLeft(RECORD_SECONDS);
              setIsRecording(false);
            }}
            disabled={isRecording || isSubmitting}
          >
            Restart
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleSubmit}
            disabled={!audioBlob || isSubmitting}
          >
            <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={startRecording}
            disabled={
              isRecording || timeLeft === 0 || audioPlaying || isSubmitting
            }
          >
            <span>Start</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-gray-500 text-white font-medium text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-400"
            onClick={stopRecording}
            disabled={!isRecording || isSubmitting}
          >
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}

//===========================Modal Component=================
const Modal = ({ isModalOpen, setIsModalOpen, onClose, serverResponse }) => {
  const scoreData = getRepeatSentenceResultData(serverResponse);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling again
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup function in case modal unmounts
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
        <Card className="w-[380px] sm:w-[450px] max-w-[95vw] max-h-[85vh] overflow-y-auto mt-10">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-500 mx-auto mb-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#810000] mb-2">
                🎉 Results
              </h2>
              <p className="text-sm text-gray-600">
                Here's your speech analysis
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                    Speaking Score
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {scoreData?.speakingScore ?? "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1 text-sm">
                    Listening Score
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {scoreData?.listeningScore ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center">
                  <h4 className="font-semibold text-purple-800 text-xs mb-1">
                    Fluency
                  </h4>
                  <p className="text-sm sm:text-lg font-bold text-purple-600">
                    {scoreData?.fluency ?? "N/A"}
                  </p>
                </div>
                <div className="bg-orange-50 p-2 sm:p-3 rounded-lg text-center">
                  <h4 className="font-semibold text-orange-800 text-xs mb-1">
                    Content
                  </h4>
                  <p className="text-sm sm:text-lg font-bold text-orange-600">
                    {scoreData?.content ?? "N/A"}
                  </p>
                </div>
                <div className="bg-pink-50 p-2 sm:p-3 rounded-lg text-center">
                  <h4 className="font-semibold text-pink-800 text-xs mb-1">
                    Pronunciation
                  </h4>
                  <p className="text-sm sm:text-lg font-bold text-pink-600">
                    {scoreData?.pronunciation ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Word Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Total Words:</span>
                    <span className="font-semibold sm:ml-1">
                      {scoreData?.totalWords ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-green-600">Good Words:</span>
                    <span className="font-semibold sm:ml-1 text-green-700">
                      {scoreData?.goodWords ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-red-600">Bad Words:</span>
                    <span className="font-semibold sm:ml-1 text-red-700">
                      {scoreData?.badWords ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {scoreData?.predictedText && (
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2 text-sm">
                    Predicted Text
                  </h4>
                  <p className="text-indigo-700 italic text-sm">
                    "{scoreData.predictedText}"
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-3 px-4 py-2 bg-[#810000] text-white rounded hover:bg-[#5d0000] font-medium text-sm"
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
