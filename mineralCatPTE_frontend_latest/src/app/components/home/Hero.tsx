import Image from "next/image";
import Link from "next/link";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";

const Hero = () => {
  return (
    <section className="lg:mr-50 lg:ml-50 md:mr-10 md:ml-10 mt-0 md:mt-20">
      <div className="flex flex-col justify-center items-center gap-2 md:gap-5 mb-8 md:-mt-10">
        <h1 className="text-[#8a0808] font-bold text-2xl lg:text-6xl text-center">
          Your PTE Success Starts Here
        </h1>
        <h1 className="font-bold lg:text-3xl text-center">
          Smart practice powered by AI!
        </h1>
        <h1 className="font-semibold text-xs md:text-xl text-center">
          Realistic mock tests, and instant feedback to improve faster and score
          higher.
        </h1>
      </div>
      <div
        className="mx-auto relative   rounded-3xl   md:py-0"
        style={{
          backgroundImage: "url('/hero/banner.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-1 md:items-center lg:grid-cols-[0.7fr_1.4fr] lg:items-center gap-10 md:gap-12 lg:gap-0">
          {/* IMAGE */}
          <div className="md:hidden  lg:flex hidden justify-center lg:justify-start">
            <Image
              src="/hero/girl.png"
              alt="Student"
              width={420}
              height={620}
              priority
              className="
                w-98
                sm:w-64
                md:w-102
                lg:w-196
                xl:w-[530px]
                -mt-15
              "
            />
          </div>

          {/* CONTENT */}
          <div className="text-center grid gap-6 md:gap-10 lg:text-left text-white p-5 md:p-8 lg:p-5">
            <h1 className="text-3xl pt-16 md:pt-20 lg:pt-0 font-bold text-center leading-tight sm:text-3xl md:text-3xl xl:text-5xl">
              Get Ready for the PTE Core Exam
            </h1>

            <p className="mt-5 md:mt-7 lg:mt-4 text-sm sm:text-sm md:text-lg lg:text-2xl text-center text-white/90">
              A complete platform to practice, improve , and <br /> succeed with
              confidence
            </p>

            <div className="mt-8 lg:mb-0 md:mb-10 mb-16 md:mt-10 flex flex-col gap-4 md:gap-8 sm:flex-row sm:justify-center lg:justify-center">
              <Link
                href="/pricing"
                className="cursor-pointer md:text-xl px-16 py-5 rounded-lg  bg-white hover:bg-transparent hover:border border-white hover:text-white text-black  text-center transition-all duration-500 ease-in-out  inline-block"
              >
                <span className="flex items-center justify-center gap-5">
                  Get Started Today{" "}
                  <FaRegArrowAltCircleRight className="mt-1" />
                </span>
              </Link>

              <Link
                href="/features"
                className="cursor-pointer md:text-xl px-16 py-5 rounded-lg text-white border hover:bg-white hover:text-black border-white  text-center transition-all duration-500 ease-in-out  inline-block"
              >
                <span className="flex items-center justify-center gap-5">
                  Explore Features <IoSearchSharp className="mt-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute right-0 top-0 h-32 w-32 sm:h-40 sm:w-40 rounded-bl-[80px] bg-white/10" />
    </section>
  );
};

export default Hero;
