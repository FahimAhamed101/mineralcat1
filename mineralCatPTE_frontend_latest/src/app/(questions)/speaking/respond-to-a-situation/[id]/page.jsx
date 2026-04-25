"use client";
import { use, useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import {
  getAssessmentMeta,
  getAssessmentTrait,
  getQuestionAssessment,
} from "@/lib/questionAssessment";
import MicRecorder from "mic-recorder-to-mp3";

// Constants
const RECORD_SECONDS = 40; // Answer time
const TRAIT_SCALE_MAX = 5;

const TRAIT_RUBRICS = {
  appropriacy: {
    title: "Appropriacy",
    levels: [
      {
        score: 5,
        label: "5",
        summary: "Highly appropriate",
        description:
          "The language functions appropriate to the situation are expressed fully, clearly, and politely in a register that matches the situation and the people involved.",
      },
      {
        score: 4,
        label: "4",
        summary: "Advanced",
        description:
          "The language functions are appropriate and clearly expressed, with only minor lapses in tone, politeness, or register.",
      },
      {
        score: 3,
        label: "3",
        summary: "Clear and polite",
        description:
          "The language functions appropriate to the situation are expressed clearly and politely in a formal or informal register appropriate to the situation and person(s) concerned.",
      },
      {
        score: 2,
        label: "2",
        summary: "Mostly appropriate",
        description:
          "The language functions elicited by the given situation are performed in a mostly appropriate register.",
      },
      {
        score: 1,
        label: "1",
        summary: "Basic routines only",
        description:
          "Uses the simplest common expressions and follows basic routines which may be inappropriate in register for the social demands of the given situation.",
      },
      {
        score: 0,
        label: "0",
        summary: "Not coherent for the situation",
        description:
          "Contains only a few very short isolated, mainly pre-packaged forms that may not relate coherently to the given situation.",
      },
    ],
  },
  pronunciation: {
    title: "Pronunciation",
    levels: [
      {
        score: 5,
        label: "5 Native-like",
        summary: "Native-like",
        description:
          "All vowels and consonants are produced in a manner that is easily understood by regular speakers of the language. Stress placement and continuous-speech features are fully appropriate.",
      },
      {
        score: 4,
        label: "4 Advanced",
        summary: "Advanced",
        description:
          "Vowels and consonants are pronounced clearly and unambiguously. A few minor distortions do not affect intelligibility, and words remain easily understandable.",
      },
      {
        score: 3,
        label: "3 Good",
        summary: "Good",
        description:
          "Most vowels and consonants are pronounced correctly. Some consistent errors might make a few words unclear. A few consonants in certain contexts may be regularly distorted, omitted or mispronounced. Stress-dependent vowel reduction may occur on a few words.",
      },
      {
        score: 2,
        label: "2 Intermediate",
        summary: "Intermediate",
        description:
          "Some consonants and vowels are consistently mispronounced in a non-native like manner. At least two thirds of speech is intelligible, but listeners might need to adjust to the accent.",
      },
      {
        score: 1,
        label: "1 Intrusive",
        summary: "Intrusive",
        description:
          "Many consonants and vowels are mispronounced, resulting in a strong intrusive foreign accent. Listeners may have difficulty understanding about one third of the words.",
      },
      {
        score: 0,
        label: "0 Non-English",
        summary: "Non-English",
        description:
          "Pronunciation seems completely characteristic of another language. Many consonants and vowels are mispronounced, mis-ordered or omitted, and listeners may find more than half of the speech unintelligible.",
      },
    ],
  },
  fluency: {
    title: "Fluency",
    levels: [
      {
        score: 5,
        label: "5 Native-like",
        summary: "Native-like",
        description:
          "Speech shows smooth rhythm and phrasing. There are no hesitations, repetitions, false starts or non-native phonological simplifications.",
      },
      {
        score: 4,
        label: "4 Advanced",
        summary: "Advanced",
        description:
          "Speech has an acceptable rhythm with appropriate phrasing and word emphasis. There is no more than one hesitation, one repetition or a false start. There are no significant non-native phonological simplifications.",
      },
      {
        score: 3,
        label: "3 Good",
        summary: "Good",
        description:
          "Speech is at an acceptable speed but may be uneven. There may be more than one hesitation, but most words are spoken in continuous phrases. There are few repetitions or false starts. There are no long pauses and speech does not sound staccato.",
      },
      {
        score: 2,
        label: "2 Intermediate",
        summary: "Intermediate",
        description:
          "Speech may be uneven or staccato. Speech (if >= 6 words) has at least one smooth three-word run, and no more than two or three hesitations, repetitions or false starts. There may be one long pause, but not two or more.",
      },
      {
        score: 1,
        label: "1 Limited",
        summary: "Limited",
        description:
          "Speech has irregular phrasing or sentence rhythm. Poor phrasing, staccato or syllabic timing, and/or multiple hesitations, repetitions, and/or false starts make spoken performance notably uneven or discontinuous. Long utterances may have one or two long pauses and inappropriate sentence-level word emphasis.",
      },
      {
        score: 0,
        label: "0 Disfluent",
        summary: "Disfluent",
        description:
          "Speech is slow and labored with little discernable phrase grouping, multiple hesitations, pauses, false starts, and/or major phonological simplifications. Most words are isolated, and there may be more than one long pause.",
      },
    ],
  },
};

function normalizeTraitScore(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? Math.min(Math.max(Math.round(numericValue), 0), TRAIT_SCALE_MAX)
    : null;
}

function getTraitLevel(traitKey, value) {
  const normalizedScore = normalizeTraitScore(value);
  if (normalizedScore === null) return null;

  return (
    TRAIT_RUBRICS[traitKey]?.levels?.find((level) => level.score === normalizedScore) ||
    null
  );
}

function formatScore(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(0) : "-";
}

function ScoreGauge({ value, max = 90, label, color = "#810000", footer = "" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3e8e8" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
          {Math.round(value)}
        </text>
      </svg>
      <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{label}</span>
      {footer ? <span className="text-[11px] font-medium text-gray-400">{footer}</span> : null}
    </div>
  );
}

function WordPill({ count, label, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 ${color}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

function toDisplayOutOf90FromTrait(value, max = TRAIT_SCALE_MAX) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0;
  return Math.round((numericValue / max) * 90);
}

export default function RespondToSituationPage({ params }) {
  const { id } = use(params);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Timers
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef();

  // Audio player
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef();
  const promptText = question?.audioConvertedText || question?.prompt || "";

  // MicRecorder instance
  const recorder = useRef(null);

  // Recorder initialization
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

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

  // Start recording handler
  const handleStartRecording = async () => {
    try {
      if (!recorder.current) {
        recorder.current = new MicRecorder({ bitRate: 128 });
      }
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch (e) {
      alert("Microphone access denied or not supported.");
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

    setSubmitLoading(true); // Start loading

    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);
    formData.append("accent", "us");

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/speaking/respond-to-a-situation/result`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit answer");
      }
      setResult(data);
      setShowModal(true);
    } catch (e) {
      alert(e?.message || "Something went wrong! Try again.");
    } finally {
      setSubmitLoading(false); // End loading
    }
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  const assessment = result
    ? getQuestionAssessment(result, "respond_to_situation")
    : null;
  const traitScaleMax = getAssessmentMeta(assessment, "traitScaleMax", TRAIT_SCALE_MAX);
  const appropriacyScore = getAssessmentTrait(assessment, "appropriacy")?.score ?? 0;
  const pronunciationScore = getAssessmentTrait(assessment, "pronunciation")?.score ?? 0;
  const fluencyScore = getAssessmentTrait(assessment, "fluency")?.score ?? 0;
  const totalTraitScore = getAssessmentMeta(assessment, "totalTraitScore", 0);
  const taskScore = getAssessmentMeta(assessment, "taskScore", assessment?.score ?? 0);
  const predictedText = getAssessmentMeta(assessment, "predictedText", "");
  const goodWords = getAssessmentMeta(assessment, "goodWords", 0);
  const averageWords = getAssessmentMeta(assessment, "averageWords", 0);
  const badWords = getAssessmentMeta(assessment, "badWords", 0);
  const progress = ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100;
  const elapsed = RECORD_SECONDS - timeLeft;
  const fmt = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* Title/Heading */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Respond to a Situation
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the situation prompt and record your response. You will have {RECORD_SECONDS}
        seconds to answer. <br />
        Respond appropriately and as clearly as you can.
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
        {promptText}
      </div>

      {/* Audio Recorder */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 w-10 text-right">{fmt(elapsed)}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-[#810000] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10">{fmt(RECORD_SECONDS)}</span>
        </div>

        <p className="text-center text-sm font-medium text-gray-500 mb-5">
          {isRecording
            ? "Recording... Speak now"
            : audioBlob
              ? "Recording complete"
              : "Press Start to begin recording"}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-40 transition"
            onClick={() => {
              setAudioBlob(null);
              setTimeLeft(RECORD_SECONDS);
              setIsRecording(false);
            }}
            disabled={isRecording}
          >
            Restart
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-[#810000] text-white font-semibold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition"
            onClick={handleStartRecording}
            disabled={isRecording || timeLeft === 0 || audioPlaying}
          >
            Start
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gray-500 text-white font-semibold text-sm hover:bg-gray-600 disabled:opacity-40 transition"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop
          </button>
          <button
            className="px-7 py-2 rounded-lg bg-[#810000] text-white font-bold text-sm hover:bg-[#6a0000] disabled:opacity-40 transition"
            onClick={handleSubmit}
            disabled={!audioBlob || submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="bg-gradient-to-r from-[#7D0000] to-[#c0392b] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">Respond to a Situation - AI Score</h2>
                <p className="text-white/75 text-sm mt-0.5">Styled to match Read Aloud</p>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
                onClick={() => setShowModal(false)}
              >
                x
              </button>
            </div>

            {result?.success ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f5c6c6] bg-[#fff5f5] px-4 py-3">
                  <p className="text-sm font-bold text-[#810000]">AI Score</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    taskScore >= 70
                      ? "bg-green-100 text-green-700"
                      : taskScore >= 45
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {taskScore >= 70 ? "Excellent" : taskScore >= 45 ? "Good" : "Needs Practice"}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Communicative Skills</p>
                  <div className="grid grid-cols-1 gap-4 bg-gray-50 rounded-xl p-4">
                    <div className="flex flex-col items-center gap-1 bg-white rounded-lg p-3 shadow-sm">
                      <ScoreGauge
                        value={toDisplayOutOf90FromTrait((appropriacyScore + pronunciationScore + fluencyScore) / 3, traitScaleMax || TRAIT_SCALE_MAX)}
                        label="Speaking"
                        color="#810000"
                        footer="Out of 90"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Enabling Skills</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-blue-700">
                        {toDisplayOutOf90FromTrait(appropriacyScore, traitScaleMax || TRAIT_SCALE_MAX)}
                        <span className="text-sm font-medium">/90</span>
                      </p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">Appropriacy</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-purple-700">
                        {toDisplayOutOf90FromTrait(fluencyScore, traitScaleMax || TRAIT_SCALE_MAX)}
                        <span className="text-sm font-medium">/90</span>
                      </p>
                      <p className="text-xs font-semibold text-purple-600 mt-0.5">Fluency</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-emerald-700">
                        {toDisplayOutOf90FromTrait(pronunciationScore, traitScaleMax || TRAIT_SCALE_MAX)}
                        <span className="text-sm font-medium">/90</span>
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">Pronunciation</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Word Quality Analysis</p>
                  <div className="grid grid-cols-3 gap-3">
                    <WordPill count={goodWords} label="Good" color="border-green-300 bg-green-50 text-green-700" />
                    <WordPill count={averageWords} label="Average" color="border-yellow-300 bg-yellow-50 text-yellow-700" />
                    <WordPill count={badWords} label="Poor" color="border-red-300 bg-red-50 text-red-700" />
                  </div>
                </div>

                {predictedText ? (
                  <div className="rounded-xl border border-[#d7ece0] bg-[#fbfffc] p-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Transcript</p>
                    <p className="text-[15px] leading-7 text-gray-800 whitespace-pre-line">{predictedText}</p>
                  </div>
                ) : null}

                <div className="bg-[#fffbea] border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                  <p className="font-bold mb-1">Score formula</p>
                  <p>Speaking uses the average of Appropriacy, Pronunciation, and Fluency.</p>
                  <p className="mt-2">Total trait score: {formatScore(totalTraitScore)} / {((traitScaleMax || TRAIT_SCALE_MAX) * 3).toFixed(0)}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-red-600">Error loading results. Please try again.</p>
              </div>
            )}

            <div className="p-6 pt-0">
              <button
                className="w-full py-3 bg-[#810000] hover:bg-[#6a0000] text-white rounded-xl font-semibold transition"
                onClick={() => setShowModal(false)}
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
