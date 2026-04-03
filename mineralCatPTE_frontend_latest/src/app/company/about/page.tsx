/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";

import parse from "html-react-parser";
import fetchWithAuth from "../../../lib/fetchWithAuth";




export default function Terms() {
  const [termsContent, setTermsContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(`${baseUrl}/about-us/`);
        if (!res || !res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        const htmlContent =
          data?.[0]?.aboutUsText || "<p>Content not found.</p>";
        setTermsContent(htmlContent);
      } catch (err) {
        setError("Error loading terms and service content.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [baseUrl]);

  

  return (
    <div className="min-h-screen mt-20 w-[80%] mx-auto">
      {/* Header */}
      <div className=" text-[#7D0000] text-center px-6 py-4"> 
        <h1 className="text-[48px] font-[600]">About US</h1>
      </div>

      {/* Content Area */}
      <div className=" mx-6 mt-6 p-8 rounded-sm shadow-sm relative min-h-96">
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-[#A85C5C] text-white p-4">
              <h1 className="text-lg font-medium">Terms</h1>
            </div>
            <div className="bg-white">
              <div className="animate-pulse">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="border-b border-gray-200 p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 py-4">{error}</div>}

        {!isLoading && !error && (
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-4 terms-content">
              {parse(termsContent)}
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
}
