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
      setResult(data);
      setShowModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
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

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* Title/Heading */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        {question.heading}
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
        {question.prompt}
      </div>

      {/* Audio Recorder */}
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

        {/* Controls */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm"
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
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleSubmit}
            disabled={!audioBlob || submitLoading}
          >
            <span>{submitLoading ? "Submitting..." : "Submit"}</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleStartRecording}
            disabled={isRecording || timeLeft === 0 || audioPlaying}
          >
            <span>Start</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-gray-500 text-white font-medium text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-400"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            <span>Stop</span>
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#ead9d9] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#810000]">Scoring Guide</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            The Respond to a Situation task is scored on three traits: Appropriacy,
            Pronunciation, and Fluency. Each trait is scored from 0 to {TRAIT_SCALE_MAX}.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {Object.entries(TRAIT_RUBRICS).map(([traitKey, trait]) => (
            <div
              key={traitKey}
              className="rounded-2xl border border-[#efe5e5] bg-[#fffafa] p-4"
            >
              <h3 className="text-base font-semibold text-[#5d0000]">{trait.title}</h3>
              <div className="mt-4 space-y-3">
                {trait.levels.map((level) => (
                  <div
                    key={`${traitKey}-${level.score}`}
                    className="rounded-xl border border-[#f2ebeb] bg-white px-3 py-3"
                  >
                    <p className="text-sm font-semibold text-[#2b2b2b]">
                      {level.label}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[#810000]">
                      {level.summary}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {level.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-y-auto mx-4 p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#810000] mb-4 text-center">
              Test Results
            </h2>

            {result?.success ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-900">
                  This task is scored on three traits: Appropriacy, Pronunciation, and Fluency.
                  Each trait is shown on a {traitScaleMax || 5}-point scale.
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Appropriacy
                    </p>
                    <p className="text-base">
                      {formatScore(appropriacyScore)} / {traitScaleMax || TRAIT_SCALE_MAX}
                    </p>
                    <p className="mt-1 text-xs text-[#810000]">
                      {getTraitLevel("appropriacy", appropriacyScore)?.summary || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Pronunciation
                    </p>
                    <p className="text-base">
                      {formatScore(pronunciationScore)} / {traitScaleMax || TRAIT_SCALE_MAX}
                    </p>
                    <p className="mt-1 text-xs text-[#810000]">
                      {getTraitLevel("pronunciation", pronunciationScore)?.summary || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Fluency
                    </p>
                    <p className="text-base">
                      {formatScore(fluencyScore)} / {traitScaleMax || TRAIT_SCALE_MAX}
                    </p>
                    <p className="mt-1 text-xs text-[#810000]">
                      {getTraitLevel("fluency", fluencyScore)?.summary || "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Total Trait Score
                    </p>
                    <p className="text-base">
                      {formatScore(totalTraitScore)} / {(
                        (traitScaleMax || TRAIT_SCALE_MAX) * 3
                      ).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Practice Score
                    </p>
                    <p className="text-base">{formatScore(taskScore)} / 100</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {[
                    { key: "appropriacy", value: appropriacyScore },
                    { key: "pronunciation", value: pronunciationScore },
                    { key: "fluency", value: fluencyScore },
                  ].map(({ key, value }) => {
                    const trait = TRAIT_RUBRICS[key];
                    const level = getTraitLevel(key, value);

                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-[#efe5e5] bg-[#fffafa] p-4"
                      >
                        <p className="text-sm font-semibold text-[#5d0000]">{trait.title}</p>
                        <p className="mt-2 text-sm font-medium text-gray-800">
                          {level?.label || "No score"}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[#810000]">
                          {level?.summary || "Not available"}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {level?.description || "Trait guidance is not available for this score."}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {predictedText ? (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Transcript
                    </h3>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-line">
                      {predictedText}
                    </div>
                  </div>
                ) : null}

                {/* Word Analysis */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Word Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Good Words
                      </p>
                      <p className="text-base">{goodWords}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Average Words
                      </p>
                      <p className="text-base">{averageWords}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Bad Words
                      </p>
                      <p className="text-base">{badWords}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-600 text-center mt-4">
                Error loading results. Please try again.
              </p>
            )}

            {/* Close button */}
            <div className="mt-6 text-center">
              <button
                className="px-6 py-2 bg-[#810000] text-white rounded-full hover:bg-[#5d0000] transition-all"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
}
