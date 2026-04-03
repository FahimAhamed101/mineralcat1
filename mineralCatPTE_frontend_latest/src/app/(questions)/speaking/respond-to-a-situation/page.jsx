"use client";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tab options
const TABS = [
  { label: "All", value: "all" },
  { label: "Not Practiced", value: "not_practiced" },
  { label: "Bookmark", value: "bookmark" },
];

// Util to trim text nicely
function trimText(text, max = 34) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export default function repeatSentence() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState("all");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Fetch data with filters
    const fetchData = async () => {
  setIsLoading(true);
  setError("");
  try {
    // tab-এর মানই হবে query-এর মান
    const query = tab;
    const response = await fetchWithAuth(
      `${baseUrl}/test/speaking/respond-to-a-situation?query=${query}`
    );
    const result = await response.json();
    if (result?.questions) {
      setData(result.questions);
      setTotalPages(Math.ceil(result.questionsCount / itemsPerPage));
    } else {
      setData([]);
      setTotalPages(1);
      setError("No data found");
    }
  } catch (err) {
    setError("An error occurred");
    setData([]);
    setTotalPages(1);
  }
  setIsLoading(false);
};

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage, tab]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Handle bookmark click
  const handleBookmark = async (item) => {
    setBookmarkLoadingId(item._id);
    try {
      // Toggle bookmark: if true, remove; if false, add
      const res = await fetchWithAuth(
        `${baseUrl}/user/bookmark`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item._id }),
        }
      );
      if (res.ok) {
        // Update only the specific item's bookmark status
        setData((prev) =>
          prev.map((q) =>
            q._id === item._id ? { ...q, bookmark: !q.bookmark } : q
          )
        );
      }
    } catch {
      // ignore error
    }
    setBookmarkLoadingId(null);
  };

  // Handle Appeared click (can be customized for your use)
  const handleAppearedClick = (item) => {
    router.push(`/speaking/respond-to-a-situation/${item._id}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm border rounded 
            ${
              currentPage === i
                ? "bg-[#810000] text-white border-[#810000]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // Tab styles
  const tabStyle = (active) =>
    `px-4 py-2 text-base font-medium cursor-pointer border-b-2 transition-all duration-150
    ${
      active
        ? "border-[#810000] text-[#810000] bg-white"
        : "border-transparent text-gray-400 bg-white hover:text-[#810000]"
    }`;

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-4 px-0 sm:px-4">
      {/* Header */}
      <div className="bg-[#810000] text-white px-2 sm:px-4 py-3 rounded-md flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <h1 className="text-lg font-medium whitespace-nowrap">Respond to a situation</h1>
        </button>
      </div>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {TABS.map((t) => (
          <div
            key={t.value}
            className={tabStyle(tab === t.value) + " flex-1 text-center"}
            onClick={() => {
              setTab(t.value);
              setCurrentPage(1);
            }}
          >
            {t.label}
          </div>
        ))}
      </div>
      {/* Content */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 min-h-[50dvh]">{error}</div>
        ) : (
          <div className="flex flex-col gap-4 min-h-[50dvh]">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#810000] bg-[#F8F8F8] rounded-md px-2 py-3 sm:px-6 sm:py-4 gap-2 sm:gap-3"
                  style={{
                    wordBreak: "break-word",
                  }}
                >
                  <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#810000] font-bold tracking-wider text-[15px] shrink-0 whitespace-nowrap">
                        #{item._id.slice(-6)}
                      </span>
                      <span className="text-gray-400 font-bold text-xl shrink-0">
                        |
                      </span>
                    </div>
                    <span
                      className="text-gray-700 font-medium truncate w-full block text-[15px] sm:text-base"
                      title={item.heading}
                      style={{ maxWidth: "100%" }}
                    >
                      {trimText(
                        item.heading,
                        window.innerWidth < 480 ? 22 : 36
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      onClick={() => handleAppearedClick(item)}
                      className="bg-[#810000] text-white px-4 sm:px-6 py-1 rounded-full font-medium text-base min-w-[72px] sm:min-w-[90px] text-center shadow hover:bg-[#5d0000] transition"
                      tabIndex={0}
                      aria-label="Go to details"
                      style={{
                        fontSize: window.innerWidth < 480 ? "13px" : "",
                      }}
                    >
                      Appeared
                    </button>
                    <button
                      onClick={() => handleBookmark(item)}
                      className={`border-2 rounded p-1 transition-all duration-200
                        ${
                          item.bookmark
                            ? "bg-[#810000] border-[#810000] text-white"
                            : "text-[#810000] border-transparent hover:border-[#810000] hover:bg-[#fceeee]"
                        }
                        ${
                          bookmarkLoadingId === item._id
                            ? "opacity-60 pointer-events-none"
                            : ""
                        }
                      `}
                      aria-label={
                        item.bookmark ? "Remove bookmark" : "Add bookmark"
                      }
                      disabled={bookmarkLoadingId === item._id}
                    >
                      <Bookmark
                        className="w-6 h-6"
                        fill={item.bookmark ? "#810000" : "none"}
                        stroke={item.bookmark ? "#fff" : "#810000"}
                        strokeWidth="2"
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </div>
        )}
        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-[#810000] text-white border-[#810000] hover:bg-[#520000] disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
          >
            Previous
          </Button>

          <div className="flex gap-1">{renderPageNumbers()}</div>

          <Input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const page = Number.parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-14 sm:w-16 h-8 text-center text-sm"
            min="1"
            max={totalPages}
          />

          <span className="text-sm text-gray-600">{itemsPerPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-[#810000] text-white border-[#810000] hover:bg-[#520000] disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 480px) {
          .truncate {
            max-width: 130px !important;
          }
        }
        @media (max-width: 640px) {
          .truncate {
            max-width: 160px;
          }
          /* Smaller font for buttons and text on mobile */
          button,
          .text-base,
          .font-medium,
          .text-lg {
            font-size: 14px !important;
          }
          .py-4,
          .sm\\:py-4 {
            padding-top: 0.65rem !important;
            padding-bottom: 0.65rem !important;
          }
        }
      `}</style>
    </div>
  );
}
