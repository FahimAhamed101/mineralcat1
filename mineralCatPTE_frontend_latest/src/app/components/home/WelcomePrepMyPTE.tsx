import Image from "next/image";
import React from "react";
import img from "@public/hero/prep.png";

const WelcomePrepMyPTE = () => {
  return (
    <div className="grid gap-10 mt-15 md:mt-30 lg:flex items-center justify-center lg:gap-40 mb-140 md:mb-150 lg:mb-0">
      <div className="px-10">
        <h1 className="font-bold text-2xl mt-7 md:mt-0 lg:text-[48px] mb-5">
          Welcome to <span className="text-[#DE3B40]">Prep My PTE</span>
        </h1>
        <p className="lg:w-120 text-sm  md:text-lg text-justify  mt-5 md:mt-0">
          Get ready to achieve your dream PTE Core score for Canadian
          immigration. PrepMyPTE offers AI-powered practice tests, instant
          scoring, and expert feedback to help you improve faster. Boost your
          English skills, raise your CRS points, and move one step closer to
          your Canada PR goal all in one smart, easy-to-use platform.
        </p>
      </div>
      <div className=" rounded-2xl px-10">
        <Image
          className="rounded-2xl max-w-full h-auto  md:w-full"
          style={{ boxShadow: "5px 5px 5px 1px rgba(0.2, 0.2,0.2, 0.2)" }}
          src={img}
          width={380}
          height={100}
          alt=""
        />
      </div>
    </div>
  );
};

export default WelcomePrepMyPTE;

