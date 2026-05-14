"use client";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TABS = [
  { label: "All", value: "all" },
  { label: "Not Practiced", value: "not_practiced" },
  { label: "Bookmark", value: "bookmark" },
];

function trimText(text, max = 36) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}...`;
}

export default function DescribeImage() {
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchWithAuth(
          `${baseUrl}/test/speaking/describe_image?query=${tab}&page=${currentPage}&limit=${itemsPerPage}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "No data found");
        }

        if (result?.questions) {
          const pageCount = Number(result?.questionsCount ?? result?.total);
          setData(result.questions);
          setTotalPages(
            Number.isFinite(pageCount) && pageCount > 0
              ? Math.ceil(pageCount / itemsPerPage)
              : 1
          );
        } else {
          setData([]);
          setTotalPages(1);
          setError("No data found");
        }
      } catch (err) {
        setError(err?.message || "An error occurred");
        setData([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    if (baseUrl) fetchData();
  }, [baseUrl, currentPage, itemsPerPage, tab]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleBookmark = async (item) => {
    setBookmarkLoadingId(item._id);

    try {
      const res = await fetchWithAuth(`${baseUrl}/user/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id }),
      });

      if (res.ok) {
        setData((prev) =>
          prev.map((question) =>
            question._id === item._id
              ? { ...question, bookmark: !question.bookmark }
              : question
          )
        );
      }
    } finally {
      setBookmarkLoadingId(null);
    }
  };

  const handleAppearedClick = (item) => {
    router.push(`/speaking/describe-image/${item._id}`);
  };

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm border rounded ${
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

  const tabStyle = (active) =>
    `px-4 py-2 text-base font-medium cursor-pointer border-b-2 transition-all duration-150 ${
      active
        ? "border-[#810000] text-[#810000] bg-white"
        : "border-transparent text-gray-400 bg-white hover:text-[#810000]"
    }`;

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-4 px-0 sm:px-4">
      <div className="bg-[#810000] text-white px-2 sm:px-4 py-3 rounded-md flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <h1 className="text-lg font-medium whitespace-nowrap">
            Describe Image
          </h1>
        </button>
      </div>

      <div className="flex border-b mb-6">
        {TABS.map((item) => (
          <div
            key={item.value}
            className={`${tabStyle(tab === item.value)} flex-1 text-center`}
            onClick={() => {
              setTab(item.value);
              setCurrentPage(1);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 min-h-[50dvh]">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4 min-h-[50dvh]">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#810000] bg-[#F8F8F8] rounded-md px-2 py-3 sm:px-6 sm:py-4 gap-2 sm:gap-3"
                >
                  <div className="flex-1 w-full flex items-center gap-3 min-w-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-12 w-16 shrink-0 rounded object-cover border border-gray-200 bg-white"
                      />
                    ) : null}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#810000] font-bold tracking-wider text-[15px] whitespace-nowrap">
                        #{item._id.slice(-6)}
                      </span>
                      <span className="text-gray-400 font-bold text-xl">|</span>
                    </div>
                    <span
                      className="text-gray-700 cursor-pointer font-medium truncate w-full block text-[15px] sm:text-base"
                      title={item.heading}
                      onClick={() => handleAppearedClick(item)}
                    >
                      {trimText(item.heading || "Describe Image")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      onClick={() => handleAppearedClick(item)}
                      className="bg-[#810000] text-white px-4 sm:px-6 py-1 rounded-full font-medium text-sm sm:text-base min-w-[72px] sm:min-w-[90px] text-center shadow hover:bg-[#5d0000] transition"
                    >
                      Appeared
                    </button>
                    <button
                      onClick={() => handleBookmark(item)}
                      className={`border-2 rounded p-1 transition-all duration-200 ${
                        item.bookmark
                          ? "bg-[#810000] border-[#810000] text-white"
                          : "text-[#810000] border-transparent hover:border-[#810000] hover:bg-[#fceeee]"
                      } ${
                        bookmarkLoadingId === item._id
                          ? "opacity-60 pointer-events-none"
                          : ""
                      }`}
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
              const page = Number.parseInt(e.target.value, 10);
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
    </div>
  );
}
