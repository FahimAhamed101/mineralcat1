/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import fetchWithAuth from "../../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router";
import AudioInput from "../audio/AudioInput";

async function getResponseErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.message || data?.error || "Request failed";
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export default function Edit() {
  const [heading, setHeading] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTextarea, setShowTextArea] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const location = useLocation();
  const api = location?.state?.api || "No previous page";
  const from = location?.state?.from || "Not found"; // For debugging
  const uniquePart = location?.state?.uniquePart || "No unique part"; // For debugging
  const isRepeatSentence = api === "/test/speaking/repeat_sentence";
  const isAnswerShortQuestion = api === "/test/speaking/answer_short_question";
  const isRespondToSituation = api === "/test/speaking/respond-to-a-situation";
  const textFieldLabel = isRepeatSentence
    ? "Expected Transcript (optional)"
    : isAnswerShortQuestion
      ? "Accepted Answers"
      : "Question Text";
  const textFieldPlaceholder = isAnswerShortQuestion
    ? "Enter accepted answers. Use one per line or separate with |"
    : isRepeatSentence
    ? "Leave blank to generate with SpeechAce"
    : "Enter body";
  const navigate = useNavigate();

  useEffect(() => {
    if (isRepeatSentence) {
      setShowTextArea(true);
      setShowInput(true);
    } else if (isAnswerShortQuestion || isRespondToSituation) {
      setShowTextArea(true);
      setShowInput(true);
    } else {
      setShowTextArea(true);
      setShowInput(false);
    }
  }, [isAnswerShortQuestion, isRepeatSentence, isRespondToSituation]);

  const handleUpdate = () => {
    setLoading(true);
    if (!heading || !api) {
      toast.error("Please fill in all fields before updating.");
      setLoading(false);
      return;
    }

    if (isAnswerShortQuestion && !questionText.trim()) {
      toast.error("Please add the accepted answers list.");
      setLoading(false);
      return;
    }

    if (showInput && audio) {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("questionId", uniquePart); // Include the unique part for editing
      if (showTextarea && questionText.trim()) {
        if (isAnswerShortQuestion) {
          formData.append("correctText", questionText.trim());
        } else if (isRepeatSentence) {
          formData.append("audioConvertedText", questionText.trim());
        } else {
          formData.append("prompt", questionText);
        }
      }
      formData.append("voice", audio);

      fetchWithAuth(`${baseUrl}${api}`, {
        method: "PUT",
        body: formData,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(await getResponseErrorMessage(response));
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            title: "Success",
            text: "Question updated successfully!",
            icon: "success",
            confirmButtonText: "OK",
          });
          // Optionally redirect or show success message
          window.location.href = from; // Redirect to the read-aloud page
        })
        .catch((error) => {
          console.error("Error updating question:", error);
          toast.error(error?.message || "Error updating the question.");
        })
        .finally(() => setLoading(false));
      return;
    }

    fetchWithAuth(`${baseUrl}${api}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        heading,
        questionId: uniquePart,
        ...(isAnswerShortQuestion
          ? { correctText: questionText.trim() }
          : isRepeatSentence
          ? questionText.trim()
            ? { audioConvertedText: questionText.trim() }
            : {}
          : { prompt: questionText }),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response));
        }
        return response.json();
      })
      .then((data) => {
        Swal.fire({
          title: "Success",
          text: "Question updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        // Optionally redirect or show success message
        // Redirect to the read-aloud page
        window.location.href = from; // Redirect to the read-aloud page
      })
      .catch((error) => {
        console.error("Error updating question:", error);
        toast.error(error?.message || "Error updating the question.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <button
        onClick={() => {
          navigate(from);
        }}
        className="w-full bg-red-700 text-white px-4 py-3 flex items-center"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span className="text-lg font-medium">Edit</span>
      </button>

      {/* Content */}
      <div className="p-4">
        {/* Heading Field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Heading
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Write here..."
            className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors"
          />
        </div>

        {/* Question Text Field */}
        {showTextarea && (
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {textFieldLabel}
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={textFieldPlaceholder}
              rows={4}
              className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors resize-none"
            />
            {isAnswerShortQuestion && (
              <p className="mt-2 text-xs text-gray-500">
                Add every accepted answer or synonym here. Use one per line or separate them with <code>|</code>.
              </p>
            )}
          </div>
        )}

        {showInput && <AudioInput audio={audio} setAudio={setAudio} />}

        {/* Update Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-3 px-24 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            {loading ? "Uploading..." : "Update Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
