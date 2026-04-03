"use client";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";


export default function AllMockTest({ children }) {

  

  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "";

  // State for data & loading/error
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch mock tests (NO pagination)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchWithAuth(`${baseUrl}/full-mock-test/getAll`)
      .then(async (response) => {
        const json = await response.json();
        if (!cancelled) {
          if (json && Array.isArray(json.FullmockTests)) {
            setData(json.FullmockTests);
            setLoading(false);
          } else {
            setError("Data not found");
            setLoading(false);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError("React Query Error: " + (e?.message || e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, []);

  // Refetch function (after delete)
  const refetch = () => {
    setLoading(true);
    setError("");
    fetchWithAuth(`${baseUrl}/full-mock-test/getAll`)
      .then(async (response) => {
        const json = await response.json();
        if (json && Array.isArray(json.FullmockTests)) {
          setData(json.FullmockTests);
          setLoading(false);
        } else {
          setError("Data not found");
          setLoading(false);
        }
      })
      .catch((e) => {
        setError("React Query Error: " + (e?.message || e));
        setLoading(false);
      });
  };
  
  // Format duration to string like "02:30"
  const formatDuration = (duration) => {
    if (!duration) return "--";
    const hours = duration.hours?.toString().padStart(2, "0") || "00";
    const minutes = duration.minutes?.toString().padStart(2, "0") || "00";
    return `${hours}:${minutes}`;
  };

  // Responsive Tailwind styles for the card
  const cardClass =
    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 p-5 border border-[#e5e2e5] rounded-lg bg-[#faf8fa] shadow-sm transition hover:shadow-lg";

  return (
    <div className="max-w-full mt-14 min-h-screen mx-auto bg-[#f6f6f7]">
      {/* Header */}
      

      {/* Content */}
      <div className="p-2 xs:p-4 sm:p-6 md:p-8">
        <p className="mb-4 text-sm text-gray-600">
          Each full mock attempt uses 1 mock-test token. AI credits are not used for full mock tests.
        </p>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a91e22]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#a91e22]">
            {error}
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
                      onClick={() => router.push(`/mock-test/confirm-page?item_id=${item._id}`)}
                      className="font-medium text-base text-[#333] flex-1 text-left hover:underline focus:outline-none cursor-pointer"
                      tabIndex={0}
                    >
                      {item.name}
                    </button>
                    <span className="text-gray-500 text-sm mt-2 sm:mt-0 sm:ml-auto">
                      Approx. Time: {formatDuration(item.duration)} hours
                    </span>
                    <span className="text-xs font-medium text-[#7D0000] bg-red-50 border border-red-100 rounded-full px-3 py-1">
                      1 mock-test token
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
