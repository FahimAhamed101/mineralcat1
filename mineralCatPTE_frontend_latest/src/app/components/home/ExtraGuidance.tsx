import Image from "next/image";
import React from "react";
import guid from "@public/home/extraGuide.png";
import Link from "next/link";

const ExtraGuidance = () => {
  return (
    <div className=" flex items-center py-20 md:py-0 justify-center xl:mb-0 xl:-mt-5 lg:p-30 p-6 ">
      <div className="lg:flex gap-8 lg:gap-30 max-w-6xl items-center justify-between bg-linear-to-r from-[#A52B1A] to-[#EF5634] text-white rounded-2xl w-full">
        {/* Text Content */}
        <div className="lg:pl-6 p-6 lg:p-0 lg:w-1/2">
          <h1 className="font-bold text-3xl sm:text-4xl lg:text-[42px] leading-tight">
            Need extra guidance ?
          </h1>
          <p className="w-full lg:w-90 my-6 lg:my-10 text-sm sm:text-base lg:text-lg">
            Join other PTE candidates improving their scores through expert
            coaching, structured lessons, and personalized feedback.
          </p>
          <Link
            href="/sign-up"
            className="cursor-pointer px-16 py-3 rounded-lg text-white bg-gradient-to-b from-[#EF5634] to-[#5A0000] hover:from-[#5A0000] hover:to-[#5A0000]  text-center transition-all duration-500 ease-in-out hover:text-white inline-block"
          >
            Sign up
          </Link>
        </div>

        {/* Image */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end mt-6 lg:mt-0">
          <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none">
            <Image
              src={guid}
              width={500}
              height={100}
              alt="Extra guidance illustration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraGuidance;
