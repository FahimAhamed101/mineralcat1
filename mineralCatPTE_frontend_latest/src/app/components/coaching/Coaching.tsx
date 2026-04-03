import Image from "next/image";
import React from "react";
import one from "@public/coaching/one.png";
import two from "@public/coaching/two.png";
import three from "@public/coaching/three.png";
import four from "@public/coaching/four.png";
import five from "@public/coaching/five.png";
import six from "@public/coaching/six.png";
import seven from "@public/coaching/seven.png";
import eight from "@public/coaching/eight.png";

const Coaching = () => {
  return (
    <div className="bg-gradient-to-b from-[#A52B1A] to-[#EF5634] w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] relative overflow-hidden">
      {/* Decorative Images - Hidden on mobile, visible on larger screens */}

      {/* Top left cluster */}
      <Image
        className="hidden md:block absolute top-12 lg:top-20 left-8 lg:left-30 w-16 h-16 lg:w-24 lg:h-24 opacity-80"
        src={one}
        width={100}
        height={100}
        alt=""
      />
      <Image
        className="hidden md:block absolute top-24 lg:top-40 left-32 lg:left-60 w-32 h-32 lg:w-48 lg:h-48 opacity-80"
        src={two}
        width={200}
        height={100}
        alt=""
      />
      <Image
        className="hidden md:block absolute top-48 lg:top-90 left-8 lg:left-30 w-16 h-16 lg:w-24 lg:h-24 opacity-80"
        src={three}
        width={100}
        height={100}
        alt=""
      />

      {/* Center cluster */}
      <Image
        className="hidden lg:block absolute top-60 lg:top-80 left-96 lg:left-160 w-28 h-28 lg:w-36 lg:h-36 opacity-80"
        src={four}
        width={150}
        height={100}
        alt=""
      />
      <Image
        className="hidden lg:block absolute top-60 lg:top-80 left-[420px] lg:left-260 w-20 h-20 lg:w-28 lg:h-28 opacity-80"
        src={five}
        width={110}
        height={100}
        alt=""
      />

      {/* Right cluster */}
      <Image
        className="hidden md:block absolute top-60 lg:top-80 right-20 lg:right-90 w-32 h-32 lg:w-48 lg:h-48 opacity-80"
        src={six}
        width={200}
        height={100}
        alt=""
      />
      <Image
        className="hidden md:block absolute top-12 lg:top-20 right-20 lg:right-90 w-24 h-24 lg:w-32 lg:h-32 opacity-80"
        src={seven}
        width={130}
        height={100}
        alt=""
      />
      <Image
        className="hidden md:block absolute top-36 lg:top-60 right-8 lg:right-40 w-16 h-16 lg:w-24 lg:h-24 opacity-80"
        src={eight}
        width={100}
        height={100}
        alt=""
      />

      {/* Main Content */}
      <div className="relative z-10 flex justify-center min-h-[200px] sm:min-h-[400px] lg:min-h-[600px] px-4 sm:px-6 md:px-8">
        <h1 className="font-bold text-4xl sm:text-5xl md:text-5xl lg:text-5xl text-center text-white w-100  leading-tight py-8 sm:py-12 md:py-16 lg:py-20">
          Trusted by candidates across the world
        </h1>
      </div>
    </div>
  );
};

export default Coaching;

