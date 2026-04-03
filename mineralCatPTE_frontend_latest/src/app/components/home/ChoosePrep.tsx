import React from "react";
import { FeatureCard } from "./FeatureCard";
const ChoosePrep = () => {
  const features = [
    {
      title: "Real Test Conditions",
      description:
        "Practice with our top PTE mock tests to experience the real exam setting in advance, and build your confidence",
      icon: (
        <svg
          width="50"
          height="50"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 12C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10C19.4477 10 19 10.4477 19 11C19 11.5523 19.4477 12 20 12Z"
            fill="#E8618C"
          />
          <path
            d="M36 29V27H33.899C33.769 26.363 33.515 25.771 33.167 25.247L34.656 23.758L33.242 22.344L31.753 23.833C31.229 23.485 30.637 23.231 30 23.101V21L28 21V23.101C27.363 23.231 26.771 23.485 26.247 23.833L24.758 22.344L23.344 23.758L24.833 25.247C24.485 25.771 24.231 26.363 24.101 27H22L22 29H24.101C24.231 29.637 24.485 30.229 24.833 30.753L23.344 32.242L24.758 33.656L26.247 32.167C26.771 32.515 27.363 32.769 28 32.899V35H30V32.899C30.637 32.769 31.229 32.515 31.753 32.167L33.242 33.656L34.656 32.242L33.167 30.753C33.515 30.229 33.769 29.637 33.899 29H36ZM31 28C31 29.103 30.103 30 29 30C27.897 30 27 29.103 27 28C27 26.897 27.897 26 29 26C30.103 26 31 26.897 31 28Z"
            fill="#E8618C"
          />
          <path
            d="M31 9L31 19.231C31.702 19.391 32.371 19.634 33 19.947V9C33 7.346 31.654 6 30 6L10 6C8.346 6 7 7.346 7 9L7 24H9L9 9C9 8.449 9.448 8 10 8L30 8C30.552 8 31 8.449 31 9Z"
            fill="#E8618C"
          />
          <path
            d="M20 28C20 27.312 20.084 26.644 20.231 26L4 26L4 27C4 29.757 6.243 32 9 32L20.947 32C20.346 30.794 20 29.439 20 28Z"
            fill="#E8618C"
          />
        </svg>
      ),
      iconBackgroundColor: "#FDF1F5",
    },
    {
      title: "Detailed Analytics",
      description:
        "After completing a mock test, you'll receive clear insights showing what went wrong and how to improve.",
      icon: (
        <svg
          width="50"
          height="50"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="24" width="4" height="12" fill="#00BCD4" />
          <rect x="16" y="16" width="4" height="20" fill="#00BCD4" />
          <rect x="24" y="8" width="4" height="28" fill="#00BCD4" />
        </svg>
      ),
      iconBackgroundColor: "#EFFCFA",
    },
    {
      title: "Smart AI Scoring",
      description:
        "Our AI-driven system delivers your scorecard in seconds, highlighting errors and providing corrections.",
      icon: (
        <svg
          width="50"
          height="50"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 19C22.1046 19 23 18.1046 23 17C23 15.8954 22.1046 15 21 15C19.8954 15 19 15.8954 19 17C19 18.1046 19.8954 19 21 19Z"
            fill="#7F55E0"
          />
          <path
            d="M20.3461 4.01618C13.3403 4.49437 7.92446 10.3555 8.00012 17.3772V17.7832L5.59012 23.0832C5.38007 23.5472 5.55231 24.0949 5.99012 24.3552L8.00012 25.5662L8.00012 29.0002C8.00012 31.2093 9.79099 33.0002 12.0001 33.0002H16.0001V36.0002L30.0001 36.0002V26.3622C33.9157 22.608 35.0857 16.8158 32.9343 11.8362C30.783 6.8565 25.7635 3.73831 20.3461 4.01618ZM28.0001 17.5002C28.0021 17.7538 27.8138 17.9687 27.5621 18.0002L25.8351 18.2162C25.7156 18.6907 25.5265 19.145 25.2741 19.5642L26.3451 20.9402C26.4997 21.1391 26.4821 21.4219 26.3041 21.6002L25.6001 22.3002C25.5062 22.3939 25.3788 22.4464 25.2461 22.4462C25.1353 22.4461 25.0277 22.4091 24.9401 22.3412L23.5601 21.2742C23.1409 21.5266 22.6867 21.7156 22.2121 21.8352L22.0001 23.5622C21.9687 23.8139 21.7538 24.0021 21.5001 24.0002H20.5001C20.2465 24.0021 20.0316 23.8139 20.0001 23.5622L19.7841 21.8352C19.3096 21.7156 18.8554 21.5266 18.4361 21.2742L17.0601 22.3452C16.9726 22.4131 16.8649 22.4501 16.7541 22.4502C16.6208 22.4494 16.4934 22.3954 16.4001 22.3002L15.7001 21.6002C15.5222 21.4219 15.5046 21.1391 15.6591 20.9402L16.7301 19.5642C16.4777 19.145 16.2887 18.6907 16.1691 18.2162L14.4381 18.0002C14.1864 17.9687 13.9982 17.7538 14.0001 17.5002V16.5002C13.9982 16.2465 14.1864 16.0316 14.4381 16.0002L16.1651 15.7842C16.2847 15.3097 16.4737 14.8554 16.7261 14.4362L15.6551 13.0642C15.4993 12.8636 15.5186 12.5779 15.7001 12.4002L16.4001 11.7002C16.5784 11.5222 16.8612 11.5046 17.0601 11.6592L18.4401 12.7262C18.8594 12.4738 19.3136 12.2847 19.7881 12.1652L20.0001 10.4382C20.0316 10.1865 20.2465 9.99823 20.5001 10.0002H21.5001C21.7538 9.99823 21.9687 10.1865 22.0001 10.4382L22.2161 12.1652C22.6907 12.2847 23.1449 12.4738 23.5641 12.7262L24.9401 11.6552C25.139 11.5006 25.4219 11.5182 25.6001 11.6962L26.3001 12.4002C26.4781 12.5784 26.4957 12.8613 26.3411 13.0602L25.2741 14.4402C25.5265 14.8594 25.7156 15.3137 25.8351 15.7882L27.5621 16.0002C27.8138 16.0316 28.0021 16.2465 28.0001 16.5002V17.5002Z"
            fill="#7F55E0"
          />
        </svg>
      ),
      iconBackgroundColor: "#F5F2FD",
    },
    {
      title: "Verified Questions",
      description:
        "All our test includes carefully selected questions that reflect the real exam and past test patterns.",
      icon: (
        <svg
          width="50"
          height="50"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 8L14 26L6 18"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ),
      iconBackgroundColor: "#FDF5F1",
    },
  ];
  return (
    <div className="relative  w-full  -mt-[470px]  lg:-mt-px  ">
      <div className="absolute w-5  top-5">
        <svg
          width="50"
          height="91"
          viewBox="0 0 50 91"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45.5624 28.5389C49.512 30.0223 50.3897 35.2172 47.1467 37.9158L-13.3722 88.2731C-16.6325 90.9859 -21.6069 89.1435 -22.3135 84.9615L-35.4984 6.92493C-36.205 2.74291 -32.112 -0.631486 -28.1414 0.859637L45.5624 28.5389Z"
            fill="url(#paint0_linear_1_729)"
            stroke="#BCC1CA"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_729"
              x1="47.0693"
              y1="-17.6021"
              x2="63.729"
              y2="81.0005"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5A0000" />
              <stop offset="1" stopColor="#EF5634" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute top-5 lg:-top-20  right-0">
        <svg
          width="50"
          height="108"
          viewBox="0 0 50 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M88.686 33.4114C95.0341 36.1328 96.4485 44.5039 91.3469 49.1599L31.1245 104.121C25.5697 109.19 16.6065 106.102 15.3533 98.6871L0.639281 11.6001C-0.613615 4.18463 6.83749 -1.67779 13.7496 1.28545L88.686 33.4114Z"
            fill="url(#paint0_linear_1_730)"
            stroke="#BCC1CA"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_730"
              x1="92.7354"
              y1="-22.5601"
              x2="113.56"
              y2="100.693"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5A0000" />
              <stop stopColor="#A52B1A" />
              <stop offset="1" stopColor="#EF5634" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute right-16 top-20">
        <svg
          width="57"
          height="59"
          viewBox="0 0 57 59"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M52.2626 17.3117C56.2356 18.7864 57.1184 24.0116 53.8505 26.7097L17.3744 56.8246C14.111 59.5188 9.15458 57.6721 8.44956 53.4993L0.580473 6.92502C-0.124547 2.75226 3.94997 -0.620327 7.91739 0.852227L52.2626 17.3117Z"
            fill="url(#paint0_linear_1_731)"
            stroke="#BCC1CA"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_731"
              x1="56.5332"
              y1="-13.0586"
              x2="-1.64228"
              y2="-3.22939"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EA916E" />
              <stop offset="1" stopColor="#EAD56C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="lg:min-h-[620px]">
        <h1 className="font-bold text-2xl   lg:text-5xl text-center">
          Why Choose <span className="text-[#DE3B40]">PrepMyPTE</span> ?
        </h1>

        <div className="mx-5 lg:mx-auto lg:max-w-7xl mt-16 ">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                iconBackgroundColor={feature.iconBackgroundColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePrep;

