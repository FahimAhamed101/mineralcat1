import Image from "next/image";
import React from "react";
import about from "@public/aboutus/aboutus.png";

const AboutUs = () => {
  return (
    <div className="grid justify-center items-center gap-10 lg:flex lg:gap-20 lg:justify-between mt-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
      <div className="text-center lg:text-left order-2 lg:order-1">
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-[48px]">
          About us
        </h1>
        <span className="flex justify-center lg:justify-start">
          <svg
            width="247"
            height="24"
            viewBox="0 0 247 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-[200px] sm:max-w-[247px]"
          >
            <g clipPath="url(#clip0_1_2816)">
              <path
                d="M249.843 24.8753C108.447 -18.6882 23.0971 4.97666 -1.90308 22.2545C106.819 -11.5247 210.889 19.3425 220.773 21.3809L249.843 24.8753Z"
                fill="#DE3B40"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_2816">
                <rect width="247" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
        <div className="mt-6 lg:mt-10 space-y-4 lg:space-y-0">
          <p className="text-base lg:w-100">
            At PrepMyPTE, we&apos;re dedicated to helping candidates achieve their
            goals in English proficiency for Canadian immigration and
            professional pathways.
          </p>
          <p className="text-base lg:w-100">
            Our mission is to make high-quality preparation accessible,
            affordable, and powered by the best AI tools available.
          </p>
          <p className="text-base lg:w-100">
            We believe in practical learning that gives real exam experience and
            accurate feedback.
          </p>
        </div>
      </div>
      <div className="order-1 lg:order-2 flex justify-center lg:block">
        <Image
          src={about}
          width={350}
          height={100}
          alt="About PrepMyPTE"
          className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-none"
        />
      </div>
    </div>
  );
};

export default AboutUs;

