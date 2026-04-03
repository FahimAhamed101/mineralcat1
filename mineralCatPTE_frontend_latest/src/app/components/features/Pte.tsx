import React from "react";
import { ChevronRight } from "lucide-react";

import one from "@public/features/one.png";
import two from "@public/features/two.png";
import Image from "next/image";
import three from "@public/features/three.png";
const Pte = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Section 1: What is PTE Core */}
      <div className="w-full max-w-7xl xl:mt-20 xl:mb-10 flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-40 p-5 md:p-8 items-center">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md  rounded-2xl flex items-center justify-center">
            <Image src={one} width={330} height={100} alt="" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-center md:text-left mb-4 md:mb-6">
            What is <span className="text-[#E8618C]">PTE Core?</span>
          </h1>
          <div className="space-y-4 text-sm sm:text-base">
            <p>
              The PTE Core is a{" "}
              <span className="font-bold">
                new English language proficiency test
              </span>{" "}
              introduced by Pearson, a global leader in education and
              assessment. Launching in February 2024, it evaluates practical,
              everyday English skills rather than academic language.
            </p>
            <p>
              <span className="font-bold">Officially approved</span> by
              Immigration, Refugees and Citizenship Canada (IRCC), PTE Core is
              valid for all Canadian economic immigration pathways, including
              work and citizenship applications. The test follows the Canadian
              Language Benchmark (CLB) standards and is delivered entirely
              online. It includes four sections: Reading, Writing, Listening,
              and Speaking, and uses advanced AI technology to ensure fast,
              fair, and accurate scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Who needs PTE Core */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row-reverse gap-8 md:gap-16 lg:gap-40 p-5 md:p-8 items-center mt-8 md:mt-12">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md aspect-square  rounded-2xl flex items-center justify-center">
            <Image src={two} width={500} height={100} alt="" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl lg:-mt-40 md:text-left mb-4 md:mb-6">
            Who needs the <span className="text-[#DE3B40]">PTE Core?</span>
          </h1>
          <div className="text-sm sm:text-base">
            <p>
              PTE Core is intended for individuals who plan to live, work, or
              settle in <span className="font-bold">Canada</span>. It can also
              be taken by those applying for Canadian citizenship. The test is
              <span className="font-bold">
                {" "}
                officially recognized by Immigration, Refugees and Citizenship
                Canada (IRCC)
              </span>{" "}
              and accepted for all Canadian economic visa programs.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Why choose PTE Core */}
      <div className="w-full max-w-7xl flex flex-col xl:mt-20 md:flex-row gap-8 md:gap-16 lg:gap-40 p-5 md:p-8 items-center mt-8 md:mt-12">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md xl:-mt-25 aspect-square  rounded-2xl flex items-center justify-center">
            <Image src={three} width={400} height={100} alt="" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col x justify-center">
          <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-center md:text-left mb-4 md:mb-6">
            Why choose <span className="text-[#DE3B40]">PTE Core?</span>
          </h1>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold mb-2">
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <path
                      d="M22 3L6 3C4.34315 3 3 4.34315 3 6L3 22C3 23.6569 4.34315 25 6 25L22 25C23.6569 25 25 23.6569 25 22L25 6C25 4.34315 23.6569 3 22 3ZM20.707 9.707L11.707 18.707C11.3165 19.0974 10.6835 19.0974 10.293 18.707L7.293 15.707C6.91403 15.3146 6.91945 14.6909 7.30518 14.3052C7.69092 13.9194 8.31462 13.914 8.707 14.293L11 16.586L19.293 8.293C19.5441 8.03304 19.9159 7.92879 20.2655 8.0203C20.6151 8.11182 20.8882 8.38486 20.9797 8.73449C21.0712 9.08412 20.967 9.45593 20.707 9.707Z"
                      fill="#DE3B40"
                    />
                  </svg>
                </span>
                Fast and easy
              </h2>
              <p className="text-sm sm:text-base">
                You can book your test online, choose a convenient date and
                location, and receive your results in about two days.
              </p>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold mb-2">
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M22 3L6 3C4.34315 3 3 4.34315 3 6L3 22C3 23.6569 4.34315 25 6 25L22 25C23.6569 25 25 23.6569 25 22L25 6C25 4.34315 23.6569 3 22 3ZM20.707 9.707L11.707 18.707C11.3165 19.0974 10.6835 19.0974 10.293 18.707L7.293 15.707C6.91403 15.3146 6.91945 14.6909 7.30518 14.3052C7.69092 13.9194 8.31462 13.914 8.707 14.293L11 16.586L19.293 8.293C19.5441 8.03304 19.9159 7.92879 20.2655 8.0203C20.6151 8.11182 20.8882 8.38486 20.9797 8.73449C21.0712 9.08412 20.967 9.45593 20.707 9.707Z"
                      fill="#DE3B40"
                    />
                  </svg>
                </span>
                Fair and consistent
              </h2>
              <p className="text-sm sm:text-base">
                Your answers are scored by computer-based technology, not
                people, which makes the results accurate and unbiased.
              </p>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold mb-2">
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M22 3L6 3C4.34315 3 3 4.34315 3 6L3 22C3 23.6569 4.34315 25 6 25L22 25C23.6569 25 25 23.6569 25 22L25 6C25 4.34315 23.6569 3 22 3ZM20.707 9.707L11.707 18.707C11.3165 19.0974 10.6835 19.0974 10.293 18.707L7.293 15.707C6.91403 15.3146 6.91945 14.6909 7.30518 14.3052C7.69092 13.9194 8.31462 13.914 8.707 14.293L11 16.586L19.293 8.293C19.5441 8.03304 19.9159 7.92879 20.2655 8.0203C20.6151 8.11182 20.8882 8.38486 20.9797 8.73449C21.0712 9.08412 20.967 9.45593 20.707 9.707Z"
                      fill="#DE3B40"
                    />
                  </svg>
                </span>
                Useful and valid
              </h2>
              <p className="text-sm sm:text-base">
                Your PTE Core score can be used for different Canadian
                immigration applications and stays valid for two years.
              </p>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold mb-2">
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M22 3L6 3C4.34315 3 3 4.34315 3 6L3 22C3 23.6569 4.34315 25 6 25L22 25C23.6569 25 25 23.6569 25 22L25 6C25 4.34315 23.6569 3 22 3ZM20.707 9.707L11.707 18.707C11.3165 19.0974 10.6835 19.0974 10.293 18.707L7.293 15.707C6.91403 15.3146 6.91945 14.6909 7.30518 14.3052C7.69092 13.9194 8.31462 13.914 8.707 14.293L11 16.586L19.293 8.293C19.5441 8.03304 19.9159 7.92879 20.2655 8.0203C20.6151 8.11182 20.8882 8.38486 20.9797 8.73449C21.0712 9.08412 20.967 9.45593 20.707 9.707Z"
                      fill="#DE3B40"
                    />
                  </svg>
                </span>
                Affordable and time-efficient
              </h2>
              <p className="text-sm sm:text-base">
                The test takes less time to complete and costs less than many
                other English exams, helping you save both time and money.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PTE Test Format Section */}
      <div className="w-full mt-12 xl:mt-40 xl:mb-40 md:mt-16 flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 mb-10">
        <h1 className="font-bold text-xl sm:text-2xl md:text-3xl text-center">
          PTE Core <span className="text-[#DE3B40]">Test Format</span>
        </h1>
        <p className="my-4 md:my-5 text-sm sm:text-base text-center">
          Total duration: ~ 2 hours (120 minutes)
        </p>

        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {/* Speaking & Writing Card */}
          <div className="border border-gray-200 p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg sm:text-xl mb-2">
              Part 1: <span className="text-[#DE3B40]">Speaking & Writing</span>
            </h2>
            <p className="text-xs sm:text-sm mt-3 mb-4 text-gray-600">
              This part will take approximately 50 minutes to complete
            </p>

            <div className="space-y-3">
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>
                  Personal Introduction (not scored toward final score)
                </span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Read Aloud</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Repeat Sentence</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Describe Image</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Respond to a Situation</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Answer Short Question</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Summarize Written Text</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Write Email</span>
              </p>
            </div>
          </div>

          {/* Reading Card */}
          <div className="border border-gray-200 p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg sm:text-xl mb-2">
              Part 2: <span className="text-[#DE3B40]">Reading</span>
            </h2>
            <p className="text-xs sm:text-sm mt-3 mb-4 text-gray-600">
              This part will take approximately 30 minutes to complete
            </p>

            <div className="space-y-3">
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Reading & Writing: Fill in the Blanks</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Multiple Choice, Multiple Answers</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Reorder Paragraph</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Fill in the Blanks</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Multiple Choice, Single Answer</span>
              </p>
            </div>
          </div>

          {/* Listening Card */}
          <div className="border border-gray-200 p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h2 className="font-bold text-lg sm:text-xl mb-2">
              Part 3: <span className="text-[#DE3B40]">Listening</span>
            </h2>
            <p className="text-xs sm:text-sm mt-3 mb-4 text-gray-600">
              This part will take approximately 30 minutes to complete
            </p>

            <div className="space-y-3">
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Summarize Spoken Text</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Multiple Choice, Multiple Answers</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Fill in the Blanks</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Multiple Choice, Single Answer</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Select Missing Word</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Highlight Incorrect Words</span>
              </p>
              <p className="flex items-start gap-2 text-xs sm:text-sm">
                <ChevronRight
                  className="text-[#DE3B40] flex-shrink-0 mt-0.5"
                  size={18}
                />
                <span>Write from Dictation</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pte;

