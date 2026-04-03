"use client";
import { useState } from "react";
import { PracticeCardsContainer } from "./PracticeCardsContainer";
import { PracticeDetails } from "./PracticeDetails";

const PracticeOverview = () => {
  const [activeCard, setActiveCard] = useState("speaking");

  return (
    <div className="lg:min-h-[640px] mt-15 lg:-mt-35 lg:bg-[#F5F5F5] lg:rounded-tl-[20rem] lg:rounded-br-[20rem] sm:rounded-tl-[10rem] sm:rounded-br-[10rem] p-10 flex flex-col justify-center items-center">
      {/* Header */}
      <div className="text-center font-bold text-4xl md:text-5xl mb-4">
        <span className="text-[#D01127]">Practice</span> Overview
      </div>

      {/* Subtitle */}
      <div className="text-center my-8 max-w-2xl">
        <h1 className="text-lg text-gray-700">
          Comprehensive PTE Core Training - Everything You Need to Succeed!
        </h1>
      </div>

      <div className="w-full flex justify-center">
        <PracticeCardsContainer
          activeCard={activeCard}
          setActiveCard={setActiveCard}
        />
      </div>

      <PracticeDetails activeCardId={activeCard} />
    </div>
  );
};

export default PracticeOverview;


