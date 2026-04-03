import Image from "next/image";
import React from "react";
import vision from "@public/aboutus/vision.png";

const OurVision = () => {
  return (
    <div className="bg-linear-to-b from-[#A52B1A] to-[#EF5634] lg:h-[532px] w-full max-w-7xl mx-auto rounded-2xl text-white">
      <div className="p-6 lg:p-10 flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 lg:px-20">
        <div className="text-center lg:text-left">
          <h1 className="font-bold text-2xl lg:text-[32px]">Our Vision</h1>
          <p className="mt-4 lg:mt-0 lg:w-100 text-sm lg:text-base">
            We believe quality exam preparation should be clear, motivating, and
            accessible to everyone.
          </p>
        </div>
        <div className="text-center lg:text-left space-y-4 lg:space-y-0">
          <p className="lg:w-100 text-sm lg:text-base">
            At PrepMyPTE, we combine AI-powered evaluation with real exam
            questions to deliver an experience that&apos;s both authentic and
            effective.
          </p>
          <p className="lg:w-100 text-sm lg:text-base">
            Our vision is to guide learners toward their goals with precision,
            confidence, and measurable progress
          </p>
        </div>
      </div>
      <div className="flex justify-center pb-6 lg:pb-0">
        <Image
          src={vision}
          height={100}
          width={520}
          alt="Our Vision"
          className="w-full max-w-[90%] sm:max-w-[400px] lg:max-w-[520px]"
        />
      </div>
    </div>
  );
};

export default OurVision;

