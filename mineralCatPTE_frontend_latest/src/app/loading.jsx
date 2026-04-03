"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [dots, setDots] = useState("")
//   console.log("Loading component initialized")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

//   console.log("Loading component rendered")

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            <span className="text-xl font-bold text-red-600">prepmypte</span>
          </div>
        </div>

        {/* Main Loading Animation */}
        <div className="relative">
          {/* Background Circle */}
          <div className="w-32 h-32 mx-auto bg-pink-100 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse opacity-20"></div>

            {/* Spinning Ring */}
            <div className="absolute inset-2 border-4 border-transparent border-t-red-500 border-r-red-500 rounded-full animate-spin"></div>

            {/* Center Icon */}
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center transform rotate-12 animate-bounce">
                <div className="w-6 h-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -right-6 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-8 -right-8 w-4 h-4 bg-red-300 rounded-full animate-ping delay-700"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Loading{dots}</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please wait while we prepare everything for you. This won&apos;t take long!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center space-x-4 mt-8">
          <div className="w-8 h-8 bg-red-200 rounded-lg transform rotate-45 animate-pulse delay-100"></div>
          <div className="w-6 h-6 bg-pink-200 rounded-full animate-pulse delay-300"></div>
          <div className="w-8 h-8 bg-red-200 rounded-lg transform rotate-45 animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-red-200 rounded-lg transform rotate-45 opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-8 w-12 h-12 bg-pink-300 rounded-full opacity-20 animate-float-slow"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(225deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
