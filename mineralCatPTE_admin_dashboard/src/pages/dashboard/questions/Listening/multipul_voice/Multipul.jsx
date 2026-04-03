/* eslint-disable no-unused-vars */
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchWithAuth from "../../../../../utils/fetchWithAuth";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { ChevronLeft, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2"; // SweetAlert for confirmation
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const MOCK_IDS_KEY = "mock_full_question_ids"; // Global mock test key

function getMockIds() {
  return JSON.parse(localStorage.getItem(MOCK_IDS_KEY) || "[]");
}
function addMockId(id) {
  const ids = getMockIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(MOCK_IDS_KEY, JSON.stringify(ids));
  }
}
function removeMockId(id) {
  const ids = getMockIds().filter((itemId) => itemId !== id);
  localStorage.setItem(MOCK_IDS_KEY, JSON.stringify(ids));
}

export default function Multiple() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [totalPages, setTotalPages] = useState(1); // Total pages state
  const [selectedIds, setSelectedIds] = useState([]);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  const navigate = useNavigate();

  const isMockTest = location?.state?.isMockTest;

  // On initial mount, load selectedIds from global key if mockTest
  useEffect(() => {
    if (isMockTest) {
      setSelectedIds(getMockIds());
    }
  }, [isMockTest]);

  // Handle select/deselect for mockTest mode (update both state & localStorage)
  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        removeMockId(id);
        return prev.filter((itemId) => itemId !== id);
      } else {
        addMockId(id);
        return [...prev, id];
      }
    });
  };

  // Fetch data using react-query
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["fetchData", currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `${baseUrl}/test/listening/multiple-choice-multiple-answers?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      if (data?.questions) {
        setTotalPages(Math.ceil((data.questionsCount) / itemsPerPage)); // Dynamically set total pages based on data
        return data.questions;
      } else {
        throw new Error("Data not found");
      }
    },
    keepPreviousData: true,
    onError: (error) => {
      console.error("React Query Error:", error);
    },
    onSuccess: (data) => {
      // console.log("React Query Success:", data);
    },
  });
 
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetchWithAuth(`${baseUrl}/admin/delete-question/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      Swal.fire("Deleted!", "Your item has been deleted.", "success");
      refetch(); // Re-fetch data after successful delete
    },
    onError: () => {
      Swal.fire("Error", "There was an error deleting the item.", "error");
    },
  });

  // Edit redirection
  const handleEdit = (item) => {
    navigate(`/question/multiple-choice-listening/${item._id}`, {
      state: {
        from: location.pathname, // Current page URL
        api: "/test/listening/multiple-choice-multiple-answers", // API URL
        uniquePart: item._id, // Unique part for the question
        type: "listening", // Specify the type for the new question
        subtype: "listening_multiple_choice_multiple_answers", // Specify the subtype for the new question
      },
    });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(item._id);
      }
    });
  };

  const handleClick = () => {
    navigate("/question/multiple-choice-listening/add", {
      state: {
        from: location.pathname, // Current page URL
        api: "/test/listening/multiple-choice-multiple-answers", // API URL
        type: "listening", // Specify the type for the new question
        subtype: "listening_multiple_choice_multiple_answers", // Specify the subtype for the new question
      },
    });
  };

  const handleAddMockQuestions = () => {
    navigate(location?.state?.url ? navigate(location.state.url) : navigate("/mock/full/add"));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    // Loop through pages and create buttons
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm border ${
            currentPage === i
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="max-w-full max-h-screen mx-auto bg-white">
      {/* Header */}
      <div className="bg-red-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2">
            
            <h1 className="text-lg font-medium">Listening (Multiple Choice - Multiple Answers)</h1>
          </button>
        </div>
        {/* Add button: Right for mockTest, normal otherwise */}
        {isMockTest ? (
          <Button
            onClick={handleAddMockQuestions}
            variant="solid"
            size="sm"
            className="bg-red-800 hover:bg-red-900 text-white border-0 ml-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Questions
          </Button>
        ) : (
          <Button
            onClick={handleClick}
            variant="solid"
            size="sm"
            className="bg-red-800 hover:bg-red-900 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            {error?.message || "An error occurred"}
          </div>
        ) : (
          <div className="space-y-3">
            {data && data.length > 0 ? (
              data.map((item) => {
                const selected = isMockTest && selectedIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    onClick={
                      isMockTest
                        ? () => handleSelect(item._id)
                        : undefined
                    }
                    className={`flex items-center justify-between p-4 border rounded-lg bg-gray-50 cursor-pointer transition-all
                    ${
                      selected
                        ? "border-red-600 ring-2 ring-red-400"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-red-700 font-medium">
                        {item._id.slice(-6)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-700">{item.heading}</span>
                    </div>
                    {/* 3dots only if not mockTest */}
                    {!isMockTest && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">No data available</div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-red-700 text-white border-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
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
            className="w-16 h-8 text-center text-sm"
            min="1"
            max={totalPages}
          />

          <span className="text-sm text-gray-600">{itemsPerPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-red-700 text-white border-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}