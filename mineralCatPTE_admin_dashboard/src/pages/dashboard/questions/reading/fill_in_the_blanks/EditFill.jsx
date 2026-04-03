/* eslint-disable no-unused-vars */


import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import fetchWithAuth from "../../../../../utils/fetchWithAuth"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { useLocation, useNavigate } from "react-router"

export default function EditFill() {
  const [heading, setHeading] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [loading, setLoading] = useState(false)
  const [blanks, setBlanks] = useState([
    {
      index: 0,
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ])

  const baseUrl = import.meta.env.VITE_ADMIN_URL || ""
  const location = useLocation()
  const api = "/test/reading/fill-in-the-blanks"
  const uniquePart = location?.state?.uniquePart || "No unique part"
  const navigate = useNavigate()

  // Load existing data if available
  useEffect(() => {
    if (location.state) {
      // Load existing question data
      if (location.state.heading) {
        setHeading(location.state.heading)
      }
      if (location.state.prompt) {
        setQuestionText(location.state.prompt)
      }
      if (location.state.blanks && Array.isArray(location.state.blanks)) {
        setBlanks(location.state.blanks)
      }
    }
  }, [location.state])

  const addBlank = () => {
    const newBlank = {
      index: blanks.length,
      options: ["", "", "", ""],
      correctAnswer: "",
    }
    setBlanks([...blanks, newBlank])
  }

  const removeBlank = (index) => {
    if (blanks.length > 1) {
      const updatedBlanks = blanks.filter((_, i) => i !== index)
      // Re-index the remaining blanks
      const reIndexedBlanks = updatedBlanks.map((blank, i) => ({
        ...blank,
        index: i,
      }))
      setBlanks(reIndexedBlanks)
    }
  }

  const updateBlankOption = (blankIndex, optionIndex, value) => {
    const updatedBlanks = blanks.map((blank, i) => {
      if (i === blankIndex) {
        const newOptions = [...blank.options]
        newOptions[optionIndex] = value
        return {
          ...blank,
          options: newOptions,
        }
      }
      return blank
    })
    setBlanks(updatedBlanks)
  }

  const setCorrectAnswer = (blankIndex, correctAnswer) => {
    const updatedBlanks = blanks.map((blank, i) => {
      if (i === blankIndex) {
        return {
          ...blank,
          correctAnswer,
        }
      }
      return blank
    })
    setBlanks(updatedBlanks)
  }

  const validateForm = () => {
    if (!heading.trim()) {
      toast.error("Please enter a heading")
      return false
    }

    if (!questionText.trim()) {
      toast.error("Please enter question text")
      return false
    }

    // Validate blanks
    for (let i = 0; i < blanks.length; i++) {
      const blank = blanks[i]

      // Check if all options are filled
      if (blank.options.some((option) => !option.trim())) {
        toast.error(`Please fill all options for blank ${i + 1}`)
        return false
      }

      // Check if correct answer is selected
      if (!blank.correctAnswer) {
        toast.error(`Please select correct answer for blank ${i + 1}`)
        return false
      }

      // Check if correct answer exists in options
      if (!blank.options.includes(blank.correctAnswer)) {
        toast.error(`Correct answer for blank ${i + 1} must be one of the options`)
        return false
      }
    }

    return true
  }

  const handleUpdate = () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    // Prepare data in the required format
    const payload = {
      questionId: uniquePart,
      newData: {
        type: "listening", // optional
        subtype: "rw_fill_in_the_blanks", // optional
        heading: heading.trim(),
        prompt: questionText.trim(),
        blanks: blanks.map((blank) => ({
          index: blank.index,
          options: blank.options.filter((option) => option.trim()),
          correctAnswer: blank.correctAnswer,
        })),
      },
    }

    fetchWithAuth(`${baseUrl}${api}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        Swal.fire({
          title: "Success",
          text: "Question updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        })
        setLoading(false)
        // Navigate to the fill-blanks-reading page
        navigate("/question/fill-blanks-reading")
      })
      .catch((error) => {
        console.error("Error updating question:", error)
        toast.error("Error updating the question.")
        setLoading(false)
      })
  }

  const goBack = () => {
    navigate("/question/fill-blanks-reading")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <button onClick={goBack} className="bg-red-700 text-white px-4 py-3 flex items-center w-full">
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span className="text-lg font-medium">Edit Question</span>
      </button>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Heading Field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Heading</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Write here..."
            className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors"
          />
        </div>

        {/* Question Text Field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Input Fill in the Blank</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your text with blanks. Use _____ to indicate where blanks should be placed."
            rows={8}
            className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Select Answer Here */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-medium text-gray-700">Select Answer Here</h3>
            <button
              onClick={addBlank}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Blank
            </button>
          </div>

          <div className="space-y-4">
            {blanks.map((blank, blankIndex) => (
              <div key={blankIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Blank {blankIndex + 1}</h4>
                  {blanks.length > 1 && (
                    <button
                      onClick={() => removeBlank(blankIndex)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs flex items-center transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Four option inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {blank.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <label className="text-xs text-gray-600 mb-1 block">Option {optionIndex + 1}</label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateBlankOption(blankIndex, optionIndex, e.target.value)}
                        placeholder={`Enter option ${optionIndex + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer selector */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Select Correct Answer</label>
                  <select
                    value={blank.correctAnswer}
                    onChange={(e) => setCorrectAnswer(blankIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-colors"
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

        {/* Update Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-24 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Question"}
          </button>
        </div>
      </div>
    </div>
  )
}
