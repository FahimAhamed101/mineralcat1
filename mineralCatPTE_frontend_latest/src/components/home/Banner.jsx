import React from "react";
import anik from "@/../public/anik.png";
import tick from "@/../public/Tick.png";
import Image from "next/image";
import { Button } from "../ui/button";

export default function Banner() {
  return (
    <div className="max-w-[1440px] mx-auto w-full px-2 py-4 sm:py-8 sm:px-6 md:px-10 lg:px-20">
      <div className="bg-gradient-to-r from-[#D80000] to-[#590000] rounded-lg shadow-lg shadow-black/50 flex items-center justify-center min-h-[350px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[580px]">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full items-center gap-6 md:gap-4">
          {/* Image Section */}
          <div className="order-2 md:order-1 flex justify-center md:justify-end items-center py-4">
            <Image
              src={anik}
              alt="PTE Banner Image (Anik Bhai)"
              width={476}
              height={571}
              className="w-[180px] h-auto sm:w-[250px] md:w-[320px] md:h-[384px] lg:w-[476px] lg:h-[571px] object-contain"
              priority
            />
          </div>

          {/* Text Section */}
          <div className="order-1 md:order-2 flex flex-col justify-center items-center md:items-start py-4">
            <h1 className="text-white text-[22px] sm:text-[28px] md:text-[36px] lg:text-[44px] font-[400] italic text-center md:text-left leading-tight">
              PTE Success Starts Here!
              <br className="hidden md:block" />
              Practice, Improve &amp; Score Higher!
            </h1>
            <div className="w-full flex justify-center md:justify-start">
              <Button className="w-[200px] sm:w-[276px] md:w-[280px] lg:w-[436px] h-[60px] sm:h-[76px] md:h-[86px] lg:h-[96px] bg-white mt-6 sm:mt-10 md:mt-16 hover:bg-gray-200 text-black text-[18px] sm:text-[22px] md:text-[24px] font-bold flex items-center justify-center gap-2">
                <Image src={tick} alt="tick" width={32} height={32} className="w-[24px] h-[24px] sm:w-[32px] sm:h-[32px] md:w-[40px] md:h-[40px] lg:w-[50px] lg:h-[50px]" />
                <span className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-[500]">PTE Made Easy!</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}