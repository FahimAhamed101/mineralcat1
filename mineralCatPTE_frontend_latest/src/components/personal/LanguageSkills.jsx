/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import Link from "next/link"
import { FaTimes } from "react-icons/fa"
import { FaMicrophone, FaPen, FaBook, FaHeadphones } from "react-icons/fa"
import { useEffect, useState } from "react"

export default function LanguageSkills({ isOpen, setIsOpen }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const skillsData = [
    {
      title: "Speaking",
      color: "bg-orange-400",
      borderColor: "border-orange-400",
      textColor: "text-orange-600",
      icon: FaMicrophone,
      tasks: ["Read Aloud", "Repeat Sentence", "Respond to a Situation", "Answer Short Question"],
    },
    {
      title: "Writing",
      color: "bg-cyan-400",
      borderColor: "border-cyan-400",
      textColor: "text-cyan-600",
      icon: FaPen,
      tasks: ["Summarize Written Text", "Write Email"],
    },
    {
      title: "Reading",
      color: "bg-green-400",
      borderColor: "border-green-400",
      textColor: "text-green-600",
      icon: FaBook,
      tasks: [
        "Fill in the Blanks",
        "Multiple Choice and answers",
        "Re-order Paragraphs",
        "Multiple Choice, Single Answer",
      ],
    },
    {
      title: "Listening",
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
      icon: FaHeadphones,
      tasks: [
        "Summarize Spoken Text",
        "Multiple Choice and answers",
        "Fill in the blanks",
        "Multiple Choice, Single Answer",
      ],
    },
  ]

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed top-28 inset-0 z-50 bg-black/30 backdrop-blur-sm">
      {/* Modal Content - Full height on mobile, 2/3 on md, 1/3 on lg+ */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white shadow-2xl h-full md:h-[66.66vh] lg:h-[33.33vh] transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "-translate-y-full"
        } flex items-center justify-center`} // Center modal content vertically and horizontally
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-auto bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content Container */}
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl flex flex-col items-center justify-center">
            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:space-x-8 w-full justify-items-center items-center  pt-46 md:pt-0">
              {skillsData.map((skill, index) => {
                const IconComponent = skill.icon
                return (
                  <div
                    key={index}
                    className="bg-white flex flex-col h-full lg:items-center items-center"
                    style={{ minWidth: 0 }}
                  >
                    {/* Header with Icon */}
                    <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200">
                      <div className={`p-2 rounded-full ${skill.color}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className={`font-semibold text-lg ${skill.textColor}`}>{skill.title}</h3>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2 w-full">
                      {skill.tasks.map((task, taskIndex) => (
                        <Link
                          key={taskIndex}
                          href={`/${skill.title.toLowerCase()}/${task
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/,/g, "")}`}
                          className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group py-1 px-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          onClick={handleClose}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${skill.color} opacity-60 group-hover:opacity-100 transition-opacity`}
                          ></div>
                          <span className="text-sm leading-relaxed group-hover:underline font-medium">{task}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div> 
        </div>
      </div>
    </div>
  )
}