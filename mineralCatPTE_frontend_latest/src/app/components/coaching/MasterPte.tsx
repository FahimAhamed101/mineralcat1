import React from "react";
import lock from "@public/coaching/lock.png";
import globe from "@public/coaching/glove.png";
import user from "@public/coaching/user.png";
import dna from "@public/coaching/dna.png";
import Image from "next/image";

const MasterPte = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-0">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[50px] my-6 sm:my-8 md:my-10 lg:my-10 lg:mt-20">
          Everything you need to{" "}
          <span className="text-[#DE3B40]">master the PTE Core</span>
        </h1>
      </div>

      <div className="flex flex-col gap-4 md:gap-5 lg:gap-5">
        {/* First Row */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-5">
          {/* Flexible Access Card */}
          <div className="w-full lg:w-1/4 relative bg-[#BAF3EB] h-60 px-4 rounded-2xl py-10">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              Flexible Access
            </h1>
            <p className="pr-20 lg:w-60">
              Your account stays active as long as you have AI credits or mock
              tests left.
            </p>
            <Image
              className="absolute right-0 bottom-0"
              src={lock}
              width={100}
              height={100}
              alt=""
            />
          </div>

          {/* Expert Coaching Card */}
          <div className="w-full lg:w-3/4 relative bg-[#CED0F8] h-60 px-4 rounded-2xl py-10">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              Expert Coaching
            </h1>
            <p className="pr-32 lg:w-100 ">
              Work with our dedicated PTE coaches who guide students and
              candidates from across the world.
            </p>
            <Image
              className="absolute right-4 bottom-4 lg:right-30 lg:bottom-12"
              src={globe}
              width={180}
              height={100}
              alt=""
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-5">
          {/* AI-Powered Scoring Card */}
          <div className="w-full lg:w-3/4 relative bg-[#F8DBD0] h-60 px-4 rounded-2xl py-10 overflow-hidden">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              AI-Powered Scoring & Feedback
            </h1>
            <p className="pr-28 lg:w-100">
              Receive instant AI evaluations for your writing and speaking
              tasks, powered by cutting-edge scoring technology. Get detailed
              feedback on grammar, pronunciation, fluency, and coherence.
            </p>
            <Image
              className="absolute right-4 bottom-4 lg:right-25 lg:bottom-12"
              src={user}
              height={100}
              width={120}
              alt=""
            />
          </div>

          {/* Smart Practice Card */}
          <div className="w-full lg:w-1/4 relative bg-[#FDF1F5] h-60 px-4 rounded-2xl py-10">
            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-[32px]">
              Smart Practice
            </h1>
            <p className="pr-24 lg:w-60">
              Train with real PTE Core tasks for every section.
            </p>
            <Image
              className="absolute right-0 bottom-0"
              src={dna}
              height={100}
              width={120}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterPte;

