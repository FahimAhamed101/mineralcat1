import Link from "next/link";
import React from "react";

const JourneyStarts = () => {
  return (
    <div className="bg-[#F3F4F6] w-full flex flex-col items-center justify-center py-5 md:p-20  -mb-10">
      <div>
        <h1 className="font-bold text-2xl text-[30px] text-center">
          Your journey <span className="text-[#DE3B40]">starts here</span>
        </h1>

        <div className="mt-10 relative grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mx-2">
          <div className="bg-white rounded-lg lg:w-100 py-6 px-3 md:px-10 h-55">
            <h1 className="text-[#636AE8] font-semibold text-[30px]">1</h1>
            <p className="text-[20px] my-5 font-semibold">Sign Up</p>
            <p className="text-sm">
              Sign up and explore our PTE Core platform, your personal dashboard
              and learning tools await.
            </p>
          </div>
          {/* arrow img green  */}
          <div className="absolute left-90 top-5 hidden lg:block">
            <svg
              width="90"
              height="83"
              viewBox="0 0 90 83"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_2216)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.63591 30.3276C1.5363 29.8507 1.5727 29.4299 2.23522 28.7204C3.59966 27.2509 7.64638 26.4327 7.9214 26.3432C10.9908 25.6763 14.111 25.2721 17.2585 25.0725C21.9247 24.7786 26.6272 24.9395 31.2483 25.2416C36.1606 25.6096 41.0188 26.2799 45.7322 27.4395C50.5054 28.6167 55.1397 30.2358 59.583 32.2609C62.2511 33.4788 64.8552 34.8347 67.3457 36.3848C73.0649 39.945 78.2352 44.3268 82.9471 49.3797C83.0979 49.5208 83.1032 49.7552 82.964 49.9038C82.8234 50.0559 82.587 50.0634 82.4366 49.9235C77.216 45.6809 71.5596 42.3202 65.6491 39.4683C63.1225 38.2518 60.5657 37.1238 57.9597 36.1071C53.6321 34.4211 49.1811 33.0789 44.6324 32.0051C40.1297 30.9436 35.5451 30.1031 30.8731 29.6662C27.1713 29.2801 23.4104 29.0065 19.6536 28.9679C15.9295 28.9312 12.217 29.1101 8.56429 29.7105L2.1209 30.496C1.82619 30.4692 1.6635 30.4623 1.63591 30.3276Z"
                  fill="#636AE8"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M72.3939 30.2334C71.8039 28.969 72.5062 27.4321 73.8742 27.1531C73.9853 27.1314 74.0663 27.124 74.1079 27.1395C74.4555 27.2655 74.7953 27.6664 75.2922 28.2028C75.725 28.6712 76.151 29.2453 76.5627 29.9071C77.6887 31.7042 78.5679 33.8515 78.7015 34.0975C80.4663 37.8072 83.1575 41.935 84.9787 46.0822C85.8576 48.0875 86.5359 50.1021 86.8702 52.0765C86.9305 52.4556 86.9634 52.9496 86.8868 53.3848C86.8208 53.7573 86.6895 54.1028 86.5029 54.4041C86.0773 55.0841 85.3969 55.54 84.4809 55.6618C83.5563 55.7904 82.0344 55.3081 81.506 55.1671C79.2328 54.5484 76.9611 54.038 74.7036 53.5433C72.571 53.076 70.4354 52.6957 68.3002 52.2527C65.0753 51.5855 61.9149 50.8252 58.5815 50.3209C58.0966 50.3006 57.7221 49.8899 57.7406 49.4042C57.7627 48.9199 58.1746 48.5449 58.6589 48.567C62.7718 48.3302 66.7572 48.1512 70.7615 48.5449C74.5716 48.9192 78.3122 49.8228 82.1028 50.7951C81.8184 49.7953 81.4448 48.7905 81.0211 47.784C79.2773 43.6513 76.6872 39.5191 75.0079 35.819L72.3939 30.2334Z"
                  fill="#636AE8"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_2216">
                  <rect
                    y="28.5024"
                    width="72"
                    height="59"
                    transform="rotate(-23.32 0 28.5024)"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div className="bg-white rounded-lg lg:w-100 py-6 px-3 md:px-10 h-55 lg:mt-20">
            <h1 className="text-[#E8618C] font-semibold text-[30px]">2</h1>
            <p className="text-[20px] my-5 font-semibold">Unlock Full Access</p>
            <p className="text-sm">
              Choose a plan to access AI-powered scoring, realistic mock tests,
              and advanced feedback designed for Canadian immigration success.
            </p>
          </div>

          {/* arrow img pink  */}
          <div className="absolute left-200 top-25 hidden lg:block">
            <svg
              width="88"
              height="81"
              viewBox="0 0 88 81"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.631389 29.2861C0.53178 28.8093 0.568183 28.3885 1.23071 27.6789C2.59514 26.2094 6.64186 25.3913 6.91689 25.3017C9.98633 24.6348 13.1065 24.2306 16.254 24.031C20.9202 23.7372 25.6227 23.8981 30.2438 24.2001C35.1561 24.5682 40.0143 25.2384 44.7277 26.398C49.5009 27.5752 54.1352 29.1943 58.5785 31.2194C61.2466 32.4374 63.8507 33.7933 66.3412 35.3433C72.0604 38.9035 77.2307 43.2853 81.9426 48.3382C82.0934 48.4793 82.0986 48.7137 81.9595 48.8623C81.8188 49.0144 81.5825 49.0219 81.4321 48.882C76.2115 44.6394 70.5551 41.2787 64.6445 38.4268C62.118 37.2103 59.5612 36.0823 56.9552 35.0656C52.6275 33.3796 48.1766 32.0374 43.6279 30.9636C39.1252 29.9021 34.5406 29.0616 29.8686 28.6247C26.1667 28.2386 22.4059 27.9651 18.649 27.9265C14.925 27.8897 11.2125 28.0686 7.55978 28.669L1.11639 29.4545C0.821674 29.4277 0.658988 29.4209 0.631389 29.2861Z"
                fill="#E8618C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M71.3894 29.1919C70.7994 27.9276 71.5017 26.3906 72.8697 26.1117C72.9808 26.0899 73.0618 26.0825 73.1033 26.098C73.451 26.224 73.7908 26.625 74.2877 27.1614C74.7205 27.6297 75.1465 28.2038 75.5581 28.8657C76.6842 30.6627 77.5634 32.8101 77.697 33.056C79.4617 36.7657 82.153 40.8936 83.9742 45.0407C84.8531 47.046 85.5314 49.0607 85.8656 51.035C85.926 51.4141 85.9589 51.9081 85.8822 52.3433C85.8163 52.7159 85.685 53.0614 85.4983 53.3626C85.0728 54.0426 84.3923 54.4985 83.4764 54.6203C82.5518 54.7489 81.0299 54.2666 80.5015 54.1256C78.2283 53.5069 75.9566 52.9965 73.6991 52.5018C71.5665 52.0345 69.4308 51.6542 67.2957 51.2113C64.0708 50.5441 60.9104 49.7838 57.577 49.2794C57.092 49.2591 56.7176 48.8484 56.7361 48.3627C56.7582 47.8784 57.1701 47.5034 57.6544 47.5255C61.7673 47.2887 65.7527 47.1097 69.757 47.5034C73.567 47.8777 77.3077 48.7813 81.0982 49.7536C80.8139 48.7538 80.4403 47.749 80.0166 46.7425C78.2728 42.6098 75.6827 38.4776 74.0034 34.7775L71.3894 29.1919Z"
                fill="#E8618C"
              />
            </svg>
          </div>

          <div className="bg-white rounded-lg lg:w-100 py-6 px-3 md:px-10 h-55 lg:mt-40">
            <h1 className="text-[#22CCB2] font-semibold text-[30px]">3</h1>
            <p className="text-[20px] my-5 font-semibold">Practice & Improve</p>
            <p className="text-sm">
              Train with real exam-style questions, monitor your progress, and
              see your confidence grow with every session.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Link href={"/sign-up"}>
          <button className="cursor-pointer px-16 py-3 rounded-lg text-white bg-gradient-to-b from-[#EF5634] to-[#5A0000] hover:from-[#5A0000] hover:to-[#5A0000]  text-center transition-all duration-500 ease-in-out hover:text-white inline-block">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default JourneyStarts;
