"use client";

import type React from "react";

interface PracticeCardData {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface PracticeCardProps {
  card: PracticeCardData;
  isActive: boolean;
  onClick: () => void;
}

export function PracticeCard({ card, isActive, onClick }: PracticeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center w-30 md:w-3xs h-35 justify-center gap-3 px-8 py-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-[#D01127] border-[#D01127]"
          : "bg-white border-[#E5E7EB] hover:border-[#D01127]"
      }`}
    >
      <div className={isActive ? "text-white" : "text-gray-700"}>
        {card.icon}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-white" : "text-gray-700"
        }`}
      >
        {card.title}
      </span>
    </button>
  );
}

