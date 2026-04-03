/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import fetchWithAuth from "../../../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router";
import AudioInput from "../../audio/AudioInput";

export default function Add_Summarize() {
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

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the API is provided in the location state
    if (
      location.state &&
      location.state.api === "/test/speaking/repeat_sentence" || location.state.api === "/test/speaking/answer_short_question" || location.state.api === "/test/listening/summarize-spoken-text"
    ) {
      setShowTextArea(false);
      setShowInput(true);
    } else if (
      location.state &&
      location.state.api === "/test/speaking/respond-to-a-situation"
    ) {
      // Example: handle a different API endpoint
      setShowTextArea(true);
      setShowInput(true);
    } else {
      setShowTextArea(true);
      setShowInput(false);
    }
  }, [location.state]);

  const handleUpdate = () => {
    // Check if heading or questionText is empty
    setLoading(true);
    if (!heading || !api) {
      toast.error("Please fill in all fields before updating.");
      return;
    }

    if (!showTextarea && showInput && audio) {
      // If audio is being uploaded, create FormData and send it
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("voice", audio); // `audio` must be a File or Blob
      formData.append("type", location.state?.type || ""); // Include the unique part for editing
      formData.append("subtype", location.state?.subtype || ""); // Include the unique part for editing

      fetchWithAuth(`${baseUrl}${api}`, {
        method: "POST",
        body: formData, // Do NOT set Content-Type manually
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
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
          toast.error("Error updating the question.");
        });
      setLoading(false);
      return; // Exit early if audio is being uploaded
    }else if(showInput && showInput && audio){
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("prompt", questionText);
      formData.append("voice", audio); // `audio` must be a File or Blob
      formData.append("type", location.state?.type || ""); // Include the unique part for editing
      formData.append("subtype", location.state?.subtype || ""); // Include the unique part for editing

      fetchWithAuth(`${baseUrl}${api}`, {
        method: "POST",
        body: formData, // Do NOT set Content-Type manually
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
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
          toast.error("Error updating the question.");
        });
      setLoading(false);
      return;
    }

    fetchWithAuth(`${baseUrl}${api}`, {
      method: "POST", // Use POST for adding a new question
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        heading,
        subtype :location.state?.subtype,
        type: location.state?.type || "", // Include the unique part for editing
        prompt: questionText,
        // You can add other fields as needed
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
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
        setLoading(false);
        // Redirect to the read-aloud page
        window.location.href = from; // Redirect to the read-aloud page
      })
      .catch((error) => {
        console.error("Error updating question:", error);
        toast.error("Error updating the question.");
      });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <button
        onClick={() => {
          navigate(from);
        }}
        className="bg-red-700 text-white px-4 py-3 flex items-center"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span className="text-lg font-medium">Add Question</span>
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
              Question Text
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter body"
              rows={4}
              className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors resize-none"
            />
          </div>
        )}

        {showInput && <AudioInput audio={audio} setAudio={setAudio} />}

        {/* Update Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            className="bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-24 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            {loading ? "Uploading..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
