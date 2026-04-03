"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import colon from "@public/home/colon.png";
interface Testimonial {
  id: number;
  text: string;
  name: string;
  location: string;
  image: string;
}

// Generate random testimonials
const generateTestimonials = (): Testimonial[] => {
  const testimonials = [
    {
      id: 1,
      text: "I used to feel lost studying alone, but Prepmypte changed that. The AI feedback helped me fix my weak spots quickly, and the mock tests felt just like the real exam. I finally passed my exam!",
      name: "Sofia L.",
      location: "Montreal",
      image: "/professional-woman.png",
    },
    {
      id: 2,
      text: "The personalized learning path was exactly what I needed. Within weeks, I saw significant improvement in my scores. The platform is intuitive and the support team is incredibly helpful.",
      name: "James M.",
      location: "Toronto",
      image: "/professional-man.png",
    },
    {
      id: 3,
      text: "Best investment I made for my exam preparation. The AI-powered feedback is spot-on, and the practice tests are comprehensive. Highly recommend to anyone serious about passing!",
      name: "Emma R.",
      location: "Vancouver",
      image: "/professional-woman-smiling.jpg",
    },
    {
      id: 4,
      text: "I was skeptical at first, but the results speak for themselves. The adaptive learning system adjusted to my pace perfectly, and I felt confident going into the exam.",
      name: "David K.",
      location: "Calgary",
      image: "/professional-man-confident.jpg",
    },
    {
      id: 5,
      text: "Outstanding platform! The mock exams are incredibly realistic, and the detailed analytics helped me identify exactly where to focus my efforts. Passed on my first try!",
      name: "Lisa T.",
      location: "Ottawa",
      image: "/professional-woman-happy.jpg",
    },
  ];

  return testimonials;
};

const UsersSaying: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const testimonials = generateTestimonials();
  const current = testimonials[currentIndex];

  const handleNext = () => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsSliding(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsSliding(false);
    }, 300);
  };

  return (
    <div className=" p-5 lg:p-20">
      <div
        style={{
          boxShadow: "1px 1px 20px 5px rgba(0.1, 0.1, 2, 0.2)",
        }}
        className="p-5 lg:p-20 mt-22 md:mt-12 lg:py-40 lg:max-w-7xl rounded-2xl mx-auto lg:flex gap-40 items-center justify-center"
      >
        <div>
          <h1 className="font-bold text-xl lg:text-[40px] text-[#DE3B40] w-80 mb-10 lg:mb-0">
            What Our Users Are Saying
          </h1>
        </div>
        <div>
          <div className="relative">
            <Image
              className="absolute -z-10 -top-10 lg:-left-10"
              src={colon}
              height={100}
              width={100}
              alt=""
            />
            <div
              className={`transition-all duration-300 ${
                isSliding
                  ? "opacity-0 translate-x-4"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <h1 className="italic opacity-55 lg:w-90 text-lg lg:text-xl leading-relaxed">
                {current.text}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-5 mt-5 transition-all duration-300 ${
                isSliding ? "opacity-0" : "opacity-100"
              }`}
            >
              {/* <Image
                src={user || "/placeholder.svg"}
                height={50}
                width={50}
                alt={current.name}
                className="rounded-full"
              /> */}
              <h1 className="font-bold text-[20px]">
                {current.name}, {current.location}
              </h1>
            </div>

            <div className="flex items-center gap-5 mt-4">
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next testimonial"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersSaying;

