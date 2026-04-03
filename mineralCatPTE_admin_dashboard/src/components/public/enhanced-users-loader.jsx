
import { Users, Search, Filter } from "lucide-react"

export function EnhancedUsersLoader() {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Animated Header */}
      <div className="bg-[#A85C5C] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 animate-pulse" />
          <div className="h-6 bg-white/20 rounded w-24 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-pulse" />
            <div className="h-8 bg-white/30 rounded w-48 pl-10"></div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-pulse" />
            <div className="h-8 bg-white/30 rounded w-32 pl-10"></div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          {/* Spinning Circle */}
          <span className="loading loading-spinner loading-lg" style={{ color: "#A85C5C" }}></span>
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">Loading Users</h3>
          <p className="text-sm text-gray-500 mt-1">
            <span className="inline-block animate-bounce">.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: "0.1s" }}>
              .
            </span>
            <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>
              .
            </span>
          </p>
        </div>

        {/* Progress Bars */}
        <div className="mt-8 w-64 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#A85C5C] animate-pulse"></div>
            <progress className="progress w-full" value="70" max="100" style={{ color: "#A85C5C" }}></progress>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#D4A574] animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <progress className="progress w-full" value="45" max="100" style={{ color: "#D4A574" }}></progress>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#8B1538] animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            <progress className="progress w-full" value="85" max="100" style={{ color: "#8B1538" }}></progress>
          </div>
        </div>
      </div>
    </div>
  )
}
