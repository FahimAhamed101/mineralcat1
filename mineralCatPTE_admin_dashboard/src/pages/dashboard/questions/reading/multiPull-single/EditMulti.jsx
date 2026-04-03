/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Trash2, Edit2 } from "lucide-react"
import fetchWithAuth from "../../../../../utils/fetchWithAuth"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { useLocation, useNavigate } from "react-router"

export default function EditSingle() {
  const [heading, setHeading] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([
    { id: 0, text: "", isCorrect: false, letter: "A" },
    { id: 1, text: "", isCorrect: false, letter: "B" },
    { id: 2, text: "", isCorrect: false, letter: "C" },
    { id: 3, text: "", isCorrect: false, letter: "D" },
    { id: 4, text: "", isCorrect: false, letter: "E" },
  ])

  const baseUrl = import.meta.env.VITE_ADMIN_URL || ""
  const location = useLocation()
  const api = "/test/reading/mcq_single"
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
      if (location.state.text) {
        setQuestion(location.state.text)
      }
      if (location.state.options && Array.isArray(location.state.options)) {
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
        const loadedOptions = location.state.options.map((optionText, index) => ({
          id: index,
          text: optionText,
          isCorrect: location.state.correctAnswers ? location.state.correctAnswers.includes(optionText) : false,
          letter: letters[index] || `${index + 1}`,
        }))
        setOptions(loadedOptions)
      }
    }
  }, [location.state])

  const addOption = () => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    const newOption = {
      id: options.length,
      text: "",
      isCorrect: false,
      letter: letters[options.length] || `${options.length + 1}`,
    }
    setOptions([...options, newOption])
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((_, i) => i !== index)
      // Re-assign letters
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
      const reIndexedOptions = updatedOptions.map((option, i) => ({
        ...option,
        id: i,
        letter: letters[i] || `${i + 1}`,
      }))
      setOptions(reIndexedOptions)
    }
  }

  const updateOptionText = (index, text) => {
    const updatedOptions = options.map((option, i) => {
      if (i === index) {
        return { ...option, text }
      }
      return option
    })
    setOptions(updatedOptions)
  }

  const toggleCorrectAnswer = (index) => {
    const updatedOptions = options.map((option, i) => {
      if (i === index) {
        return { ...option, isCorrect: !option.isCorrect }
      }
      return option
    })
    setOptions(updatedOptions)
  }

  const getOptionColor = (letter) => {
    const colors = {
      A: "bg-red-500",
      B: "bg-blue-500",
      C: "bg-green-500",
      D: "bg-yellow-500",
      E: "bg-purple-500",
      F: "bg-pink-500",
      G: "bg-indigo-500",
      H: "bg-gray-500",
      I: "bg-orange-500",
      J: "bg-teal-500",
    }
    return colors[letter] || "bg-gray-500"
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

    if (!question.trim()) {
      toast.error("Please enter the question")
      return false
    }

    // Check if all options are filled
    if (options.some((option) => !option.text.trim())) {
      toast.error("Please fill all option fields")
      return false
    }

    // Check if at least one correct answer is selected
    if (!options.some((option) => option.isCorrect)) {
      toast.error("Please select at least one correct answer")
      return false
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
        type: "reading",
        subtype: "mcq_single",
        heading: heading.trim(),
        prompt: questionText.trim(),
        text: question.trim(),
        options: options.map((option) => option.text.trim()),
        correctAnswers: options.filter((option) => option.isCorrect).map((option) => option.text.trim()),
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
        // Navigate to the multiple choice page
        navigate("/question/multiple-choice-single-reading")
      })
      .catch((error) => {
        console.error("Error updating question:", error)
        toast.error("Error updating the question.")
        setLoading(false)
      })
  }

  const goBack = () => {
    navigate("/question/multiple-choice-single-reading")
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
          <label className="block text-gray-700 text-sm font-medium mb-2">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter body"
            rows={6}
            className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors resize-none"
          />
          <div className="text-right text-xs text-gray-400 mt-1">Max 350 word</div>
        </div>

        {/* Question Field */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Write question here..."
            className="w-full px-3 py-3 bg-gray-200 border-0 rounded-md text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition-colors"
          />
        </div>

        {/* Select Multiple Options */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-gray-700 text-sm font-medium">
              Select Multiple checkbox for Multiple answer & Input option here
            </label>
            <button
              onClick={addOption}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={() => toggleCorrectAnswer(index)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />

                {/* Letter Circle */}
                <div
                  className={`w-8 h-8 rounded-full ${getOptionColor(option.letter)} flex items-center justify-center text-white font-medium text-sm`}
                >
                  {option.letter}
                </div>

                {/* Option Text Input */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  placeholder={`Most cases of skin cancer are linked to exposure to ultraviolet radiation.`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-colors"
                />

                {/* Edit/Delete Icons */}
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
