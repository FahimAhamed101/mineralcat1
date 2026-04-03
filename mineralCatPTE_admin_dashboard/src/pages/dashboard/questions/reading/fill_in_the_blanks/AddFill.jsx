/* eslint-disable no-unused-vars */

import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import fetchWithAuth from "../../../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AddFillBlanks() {
  const [heading, setHeading] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [blanks, setBlanks] = useState([
    {
      index: 0,
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);

  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const api = "/test/reading/fill-in-the-blanks";
  const from = "/dashboard";

  const navigate = useNavigate();

  const addBlank = () => {
    const newBlank = {
      index: blanks.length,
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setBlanks([...blanks, newBlank]);
  };

  const removeBlank = (index) => {
    if (blanks.length > 1) {
      const updatedBlanks = blanks.filter((_, i) => i !== index);
      const reIndexedBlanks = updatedBlanks.map((blank, i) => ({
        ...blank,
        index: i,
      }));
      setBlanks(reIndexedBlanks);
    }
  };

  const updateBlankOption = (blankIndex, optionIndex, value) => {
    const updatedBlanks = blanks.map((blank, i) => {
      if (i === blankIndex) {
        const newOptions = [...blank.options];
        newOptions[optionIndex] = value;
        return { ...blank, options: newOptions };
      }
      return blank;
    });
    setBlanks(updatedBlanks);
  };

  const setCorrectAnswer = (blankIndex, correctAnswer) => {
    const updatedBlanks = blanks.map((blank, i) => {
      if (i === blankIndex) {
        return { ...blank, correctAnswer };
      }
      return blank;
    });
    setBlanks(updatedBlanks);
  };

  // Use SweetAlert2's toast for a more professional alert experience
  const showToast = (message, type = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: "#fff",
      color: "#22223b",
      customClass: {
        popup: "swal2-toast-custom",
        title: "swal2-title-custom",
        icon: "swal2-icon-custom"
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  };

  const validateForm = () => {
    if (!heading.trim()) {
      showToast("⚠️ Please enter a heading", "warning");
      return false;
    }
    if (!questionText.trim()) {
      showToast("⚠️ Please enter question text", "warning");
      return false;
    }
    for (let i = 0; i < blanks.length; i++) {
      const blank = blanks[i];
      if (blank.options.some((option) => !option.trim())) {
        showToast(`⚠️ Fill all options for blank ${i + 1}`, "warning");
        return false;
      }
      if (!blank.correctAnswer) {
        showToast(`⚠️ Select correct answer for blank ${i + 1}`, "warning");
        return false;
      }
      if (!blank.options.includes(blank.correctAnswer)) {
        showToast(`⚠️ Correct answer for blank ${i + 1} must be one of the options`, "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    const payload = {
      type: "reading",
      subtype: "rw_fill_in_the_blanks",
      heading: heading.trim(),
      prompt: questionText.trim(),
      blanks: blanks.map((blank) => ({
        index: blank.index,
        options: blank.options.filter((option) => option.trim()),
        correctAnswer: blank.correctAnswer,
      })),
    };

    try {
      const response = await fetchWithAuth(`${baseUrl}${api}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      await response.json();
      Swal.fire({
        icon: "success",
        title: "Question added successfully!",
        text: "Your fill-in-the-blanks question has been saved.",
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true,
        position: "center",
        background: "#f6fff8",
        color: "#22223b",
        customClass: {
          popup: "swal2-popup-custom",
          title: "swal2-title-custom",
          icon: "swal2-icon-custom"
        },
      }).then(() => {
        navigate("/question/fill-blanks-reading");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to add the question",
        text: error.message || "Something went wrong. Please try again.",
        showConfirmButton: true,
        confirmButtonColor: "#b91c1c",
        background: "#fff0f3",
        color: "#22223b",
        customClass: {
          popup: "swal2-popup-custom",
          title: "swal2-title-custom",
          icon: "swal2-icon-custom"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#b91c1c",
          color: "white",
          padding: "12px 16px",
        }}
      >
        <button
          onClick={goBack}
          style={{
            background: "none",
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            fontSize: "18px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          <ChevronLeft style={{ marginRight: "8px", width: "20px", height: "20px" }} />
          <span>Add Question</span>
        </button>
      </div>

      <div
        style={{
          padding: "16px",
          maxWidth: "1024px",
          margin: "0 auto",
        }}
      >
        {/* Heading Field */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Heading
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Write here..."
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              color: "#374151",
              fontSize: "16px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.boxShadow = "0 0 0 2px #b91c1c";
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.style.backgroundColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }
            }}
          />
        </div>

        {/* Question Text Field */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Input Fill in the Blank
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your text with blanks. Use _____ to indicate where blanks should be placed."
            rows={8}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              color: "#374151",
              fontSize: "16px",
              resize: "none",
              fontFamily: "inherit",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.boxShadow = "0 0 0 2px #b91c1c";
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.style.backgroundColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }
            }}
          />
        </div>

        {/* Select Answer Here */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#374151",
                margin: 0,
              }}
            >
              Select Answer Here
            </h3>
            <button
              onClick={addBlank}
              style={{
                backgroundColor: "#b91c1c",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#991b1b";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#b91c1c";
              }}
            >
              <Plus style={{ marginRight: "4px", width: "16px", height: "16px" }} />
              Add Blank
            </button>
          </div>

          <div>
            {blanks.map((blank, blankIndex) => (
              <div
                key={blankIndex}
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Blank {blankIndex + 1}
                  </div>
                  {blanks.length > 1 && (
                    <button
                      onClick={() => removeBlank(blankIndex)}
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#b91c1c";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#dc2626";
                      }}
                    >
                      <Trash2 style={{ width: "12px", height: "12px" }} />
                    </button>
                  )}
                </div>

                {/* Four option inputs */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {blank.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={{ display: "flex", flexDirection: "column" }}>
                      <label
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        Option {optionIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateBlankOption(blankIndex, optionIndex, e.target.value)}
                        placeholder={`Enter option ${optionIndex + 1}`}
                        style={{
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#b91c1c";
                          e.target.style.boxShadow = "0 0 0 1px #b91c1c";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer selector */}
                <div style={{ marginTop: "12px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Select Correct Answer
                  </label>
                  <select
                    value={blank.correctAnswer}
                    onChange={(e) => setCorrectAnswer(blankIndex, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#b91c1c";
                      e.target.style.boxShadow = "0 0 0 1px #b91c1c";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <option value="">Choose correct answer</option>
                    {blank.options.map(
                      (option, optionIndex) =>
                        option.trim() && (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ),
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#b91c1c",
              color: "white",
              border: "none",
              padding: "12px 96px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#991b1b";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#b91c1c";
              }
            }}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
      {/* SweetAlert2 custom style for extra polish */}
      <style>{`
        .swal2-popup-custom {
          border-radius: 16px !important;
          box-shadow: 0 10px 38px 0 rgba(31,38,135,0.2) !important;
        }
        .swal2-title-custom {
          font-weight: 700 !important;
          font-size: 1.3rem !important;
          letter-spacing: 0.01em;
        }
        .swal2-icon-custom {
          border-radius: 8px !important;
        }
        .swal2-toast-custom {
          border-radius: 10px !important;
          font-size: 1rem !important;
          box-shadow: 0 2px 16px #bbb4 !important;
        }
      `}</style>
    </div>
  );
}