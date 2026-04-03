"use client";
import React, { useState, useEffect } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";


import { useRouter } from "next/navigation";


export default function SectionalMockTest() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "";

  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [activeType, setActiveType] = useState("Speaking");

  const buttons = ["Speaking", "Writing", "Reading", "Listening"];

  const getButtonClasses = (type) => {
    const isActive = activeType === type;
    return `border rounded px-6  md:px-12 py-2 transition-colors duration-200 ${
      isActive
        ? "border-[#973333] text-[#7D0000] bg-red-100"
        : "bg-slate-100 text-slate-600"
    }`;
  };

  
  const formatDuration = (duration) => {
    if (!duration) return "--";
    const hours = duration.hours?.toString().padStart(2, "0") || "00";
    const minutes = duration.minutes?.toString().padStart(2, "0") || "00";
    return `${hours}:${minutes}`;
  };
  
  
 useEffect(() => {
  let cancelled = false;
  const typeOfSectionalMockTest = activeType.toLowerCase(); 

  
  setLoading(true);
  setError("");

  fetchWithAuth(`${baseUrl}/sectional-mock-test/getAll/${typeOfSectionalMockTest}`)
    .then(async (response) => {
      console.log('Response received:', response.status);
      const json = await response.json();
      

      if (!cancelled) {
        if (json && Array.isArray(json.sectionalMockTests)) {
          setData(json.sectionalMockTests);
          setLoading(false);
        } else {
          console.log('Data structure issue:', json);
          setError("Data not found");
          setLoading(false);
        }
      }
    })
    .catch((e) => {
      console.error('Fetch error:', e);
      if (!cancelled) {
        setError("React Query Error: " + (e?.message || e));
        setLoading(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, [activeType]); 


  
  const cardClass =
    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 p-5 border border-[#e5e2e5] rounded-lg bg-[#faf8fa] shadow-sm transition hover:shadow-lg";

  return (
    
    <div className="max-w-full mt-14 min-h-screen mx-auto ">
      {/* Header */}
      <div className=" grid grid-cols-2 mb-5 md:flex items-center justify-center gap-10">
          {buttons.map((type) => (
        <button
          key={type}
          onClick={() => setActiveType(type)}
          className={getButtonClasses(type)}
        >
          {type}
        </button>
      ))}
        </div>
        
      {/* Content */}
      <div className="p-2 xs:p-4 sm:p-6 md:p-8">
        <p className="mb-4 text-sm text-gray-600">
          Sectional mock tests use a fixed AI-credit cost per attempt. The cost can differ by test.
        </p>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a91e22]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item._id}
                  className={cardClass}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full cursor-pointer">
                    <span className="text-[#a91e22] font-semibold min-w-[90px] break-all">
                      #{item._id}
                    </span>
                    <span className="hidden sm:block text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => router.push(`/mock-test/sectional-mock-test/confirm-page?item_id=${item._id}`)}
                      className="font-medium text-base text-[#333] flex-1 text-left hover:underline focus:outline-none cursor-pointer"
                      tabIndex={0}
                    >
                      {item.name}
                    </button>
                    <span className="text-gray-500 text-sm mt-2 sm:mt-0 sm:ml-auto">
                      Approx. Time: {formatDuration(item.duration)} hours
                    </span>
                    <span className="text-xs font-medium text-[#7D0000] bg-red-50 border border-red-100 rounded-full px-3 py-1">
                      {item.aiCreditCost ?? 1} AI credits
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-lg text-gray-600">
                No mock test found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
