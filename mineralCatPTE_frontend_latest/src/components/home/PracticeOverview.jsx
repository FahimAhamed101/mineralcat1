"use client";

import { useEffect, useState } from "react";
import { Mic, PenTool, BookOpen, Volume2 } from "lucide-react";
import practiceData from "@/../public/data.json";

// TypeScript interfaces removed for pure JS compatibility

export default function PracticeOverview() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const [questionCount, setQuestionCount] = useState(null);
  // Getting question counts
  useEffect(() => {
    fetch(`${baseUrl}/user/questions-counts`)
      .then((res) => res.json())
      .then((data) => setQuestionCount(data))
      .catch((error) => {
        console.error("Error fetching question counts:", error);
        setQuestionCount(null);
      });
  }, [baseUrl]);

  const [activeCategory, setActiveCategory] = useState("speaking");
  const data = practiceData;

  const getActiveIcon = (category) => {
    const iconClass =
      activeCategory === category
        ? "w-6 h-6 text-white"
        : "w-6 h-6 text-gray-600";
    switch (category) {
      case "speaking":
        return <Mic className={iconClass} />;
      case "writing":
        return <PenTool className={iconClass} />;
      case "reading":
        return <BookOpen className={iconClass} />;
      case "listening":
        return <Volume2 className={iconClass} />;
      default:
        return null;
    }
  };

  const currentData = data[activeCategory];

  return (
    <div className="min-h-screen  relative overflow-hidden">
      {/* Decorative curved lines */}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl ">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-red-900">Practice</span>{" "}
            <span className="text-gray-800">Overview</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl w-full lg:w-full lg:max-w-[80%] mx-auto">
            Comprehensive PTE Training – Everything You Need to Succeed!
          </p>
        </div>

        {/* Practice Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.keys(data).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer
                ${
                  activeCategory === category
                    ? "bg-red-800 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                {getActiveIcon(category)}
                <span className="font-semibold text-sm md:text-base capitalize">
                  {category} Practice
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid md:grid-cols-2  items-start md:items-center h-auto md:h-[267px] w-full md:w-6xl">
            {/* Left side - Number and label */}
            <div className="text-center md:text-left p-0 md:p-4">
              <div className="text-6xl md:text-8xl font-bold text-red-900 mb-2">
                {questionCount?.data?.[currentData.id] || 0}
              </div>
              <div className="text-gray-600 text-lg md:text-xl font-medium">
                {currentData.label}
              </div>
            </div>

            {/* Right side - Details */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-800 mb-6">
                {currentData.title}
              </h2>
              <ul className="space-y-4">
                {currentData.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-base md:text-lg leading-relaxed">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}