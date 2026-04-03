import React from "react";
import right from "@public/history/right.png";
import left from "@public/history/left.png";
import Image from "next/image";
import Link from "next/link";

const History = () => {
  const circle = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="16" fill="#DE3B40" />
      <circle cx="16" cy="16" r="16" stroke="#BCC1CA" />
      <circle cx="16" cy="16" r="7" fill="#F8F9FA" />
      <circle cx="16" cy="16" r="7" stroke="#BCC1CA" />
    </svg>
  );

  const arrow = (
    <svg
      width="6"
      height="172"
      viewBox="0 0 6 172"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hidden lg:block"
    >
      <path
        d="M2.88672 172L5.77347 167H-3.25959e-05L2.88672 172ZM2.38672 0V2.6875H3.38672V0H2.38672ZM2.38672 8.0625V13.4375H3.38672V8.0625H2.38672ZM2.38672 18.8125V24.1875H3.38672V18.8125H2.38672ZM2.38672 29.5625V34.9375H3.38672V29.5625H2.38672ZM2.38672 40.3125V45.6875H3.38672V40.3125H2.38672ZM2.38672 51.0625V56.4375H3.38672V51.0625H2.38672ZM2.38672 61.8125V67.1875H3.38672V61.8125H2.38672ZM2.38672 72.5625V77.9375H3.38672V72.5625H2.38672ZM2.38672 83.3125V88.3889H3.38672V83.3125H2.38672ZM2.38672 93.1667V97.9444H3.38672V93.1667H2.38672ZM2.38672 102.722V107.5H3.38672V102.722H2.38672ZM2.38672 112.278V117.056H3.38672V112.278H2.38672ZM2.38672 121.833V126.611H3.38672V121.833H2.38672ZM2.38672 131.389V136.167H3.38672V131.389H2.38672ZM2.38672 140.944V145.722H3.38672V140.944H2.38672ZM2.38672 150.5V155.278H3.38672V150.5H2.38672ZM2.38672 160.056V164.833H3.38672V160.056H2.38672Z"
        fill="#BCC1CA"
      />
    </svg>
  );

  return (
    <div className="relative lg:min-h-screen w-full flex flex-col items-center px-4 py-12 lg:py-0">
      {/* Decorative images - hidden on mobile */}
      <div className="absolute right-0 top-0 hidden lg:block">
        <Image src={right} width={200} height={100} alt="" />
      </div>
      <div className="absolute left-0 bottom-30 hidden lg:block">
        <Image src={left} width={200} height={100} alt="" />
      </div>

      {/* Title */}
      <div className="mb-12 lg:mb-0">
        <h1 className="font-bold text-[32px] lg:text-[48px] text-center">
          Our History
        </h1>
      </div>

      {/* Timeline */}
      <div className="mt-8 lg:mt-20 w-full max-w-6xl">
        {/* 2021 Entry */}
        <div className="mb-8 lg:mb-0">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
            {/* Left side - Year and description */}
            <div className="lg:w-[45%] lg:text-right lg:pr-12">
              <h1 className="font-bold text-[32px] text-start lg:text-[40px] text-[#DE3B40] mb-2 lg:mb-4">
                2021
              </h1>
              <p className="text-[14px] text-start lg:text-[16px] leading-relaxed">
                The journey began with the creation of{" "}
                <Link href="https://prepmontcfca.com/" className="text-[#379AE6]  border-b border-[#379AE6] ">PrepMonTCFCA</Link>
                , helping thousands of French speakers prepare efficiently for
                the TCF Canada exam.
              </p>
            </div>

            {/* Center - Timeline indicator */}
            <div className="hidden lg:flex lg:mt-5 flex-col items-center my-4 lg:my-0">
              {circle}
              {arrow}
            </div>

            {/* Right side - empty for 2021 */}
            <div className="hidden lg:block lg:w-[45%]"></div>
          </div>
        </div>

        {/* 2024 Entry */}
        <div className="mb-8 lg:mb-0">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
            {/* Left side - empty for 2024 on desktop */}
            <div className="hidden lg:block lg:w-[45%]"></div>

            {/* Center - Timeline indicator */}
            <div className="hidden lg:mt-2 lg:flex flex-col items-center my-4 lg:my-0">
              {circle}
              {arrow}
            </div>

            {/* Right side - Year and description */}
            <div className="lg:w-[45%] lg:pl-12">
              <h1 className="font-bold text-[32px] text-start lg:text-[40px] text-[#DE3B40] mb-2 lg:mb-4">
                2024
              </h1>
              <p className="text-[14px] lg:text-[16px] text-start leading-relaxed">
                Our growing community inspired us to explore broader language
                testing solutions, focusing on innovation and learner support.
              </p>
            </div>
          </div>
        </div>

        {/* 2025 Entry */}
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
            {/* Left side - Year and description */}
            <div className="lg:w-[45%] lg:text-right lg:pr-12">
              <h1 className="font-bold text-start text-[32px] lg:text-[40px] text-[#DE3B40] mb-2 lg:mb-4">
                2025
              </h1>
              <p className="text-[14px] text-start lg:text-[16px] leading-relaxed">
                We launched PrepMyPTE, a complete preparation ecosystem for the
                PTE Core exam, empowering candidates worldwide to achieve their
                Canadian immigration goals.
              </p>
            </div>

            {/* Center - Timeline indicator */}
            <div className="hidden lg:mt-2 lg:flex flex-col items-center my-4 lg:my-0">
              {circle}
            </div>

            {/* Right side - empty for 2025 */}
            <div className="hidden lg:block lg:w-[45%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;

