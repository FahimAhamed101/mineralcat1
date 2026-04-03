"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import woman from "@public/faq/woman.png";
import Link from "next/link";

type FAQProps = {
  endpoint?: string;
};

const FAQ = ({ endpoint = "/faqs" }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<{ question: string; answer: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (!response.ok) {
          throw new Error("Failed to load FAQs");
        }
        const data = await response.json();
        setFaqData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [baseUrl, endpoint]);

  const toggleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-14 md:mt-28 grid justify-center px-4">
      <div className="text-center">
        <h1 className="font-bold text-4xl md:text-5xl">
          Frequently Asked <span className="text-[#D01127]">Questions</span>{" "}
        </h1>
        <p className="my-5">Quick answers for a smarter PTE journey</p>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-15 w-full max-w-7xl mx-auto">
        {/* dropdown section with fixed width */}
        <div className="w-full lg:w-[600px] space-y-4">
          {loading && (
            <div className="text-gray-600">Loading FAQs...</div>
          )}
          {!loading && error && (
            <div className="text-red-600">{error}</div>
          )}
          {!loading && !error && faqData.length === 0 && (
            <div className="text-gray-600">No FAQs available.</div>
          )}
          {!loading &&
            !error &&
            faqData.map((item, index) => (
            <div key={index} className="rounded-lg overflow-hidden w-full">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full bg-[#FFF7F7] p-4 flex justify-between items-center text-left font-medium hover:bg-[#ffecec] transition-all duration-200"
                style={{
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <span className="flex-1 pr-4">{item.question}</span>
                <span className="text-xl font-bold ">
                  {openIndex === index ? "-" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="bg-white p-4 border-t border-gray-200 w-full animate-fadeIn">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* image section */}
        <div className="w-full lg:flex-1 flex justify-center lg:justify-center items-center -mt-10">
          <Image
            src={woman}
            width={400}
            height={300}
            alt="Woman with question mark"
            className="w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link href={"/features"}>
          <span
            className="cursor-pointer px-16 py-3 rounded-lg text-white bg-gradient-to-b from-[#EF5634] to-[#5A0000] hover:from-[#5A0000] hover:to-[#5A0000]  text-center transition-all duration-500 ease-in-out hover:text-white inline-block"
            style={{
              boxShadow: "5px 5px 5px 1px rgba(0, 0, 0, 0.2)",
            }}
          >
            All about the PTE Core Exam
          </span>

        </Link>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FAQ;





