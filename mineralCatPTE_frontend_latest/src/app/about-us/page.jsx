import Image from "next/image";
import AboutUs from "../components/about-us/AboutUs";
import OurVision from "../components/about-us/OurVision";
import History from "../components/about-us/History";
import guid from "@public/home/extraGuide.png";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center gap-20">
      <AboutUs />
      <OurVision />
      <div className="lg:mb-20">
        <History />
      </div>

      <div className="flex items-center justify-center pb-30 p-6 lg:-mt-30">
        <div className="lg:flex gap-8 lg:gap-30 max-w-6xl items-center justify-between bg-linear-to-r from-[#A52B1A] to-[#EF5634] text-white rounded-2xl w-full">
          <div className="lg:pl-6 p-6 lg:p-0 lg:w-1/2">
            <h1 className="font-bold text-3xl sm:text-4xl lg:text-[45px] leading-tight">
              Our Mission
            </h1>
            <p className="w-full lg:w-90 mt-5 text-sm sm:text-base lg:text-lg">
              To simplify and personalize the path to Canadian immigration success.
            </p>
            <p className="w-full lg:w-90 text-sm sm:text-base lg:text-lg">
              Through PrepMyPTE, we combine real exam experience, smart AI evaluation,
              and continuous improvement tools, ensuring every candidate feels ready
              and confident on test day.
            </p>
          </div>

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
    </div>
  );
}
