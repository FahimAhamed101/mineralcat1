/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchWithAuth from "../../../../utils/fetchWithAuth";
import { Button } from "../../../../components/ui/button";
import { ChevronLeft, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router";

export default function AllMockTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  // Fetch mock tests (NO pagination)
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["fetchMockTests"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `${baseUrl}/full-mock-test/getAll`
      );
      const json = await response.json();
      if (json && Array.isArray(json.FullmockTests)) {
        return json.FullmockTests;
      } else {
        throw new Error("Data not found");
      }
    },
    onError: (error) => {
      console.error("React Query Error:", error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetchWithAuth(`${baseUrl}/admin/delete-mock-test/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      Swal.fire("Deleted!", "Mock Test has been deleted.", "success");
      refetch();
    },
    onError: () => {
      Swal.fire("Error", "There was an error deleting the mock test.", "error");
    },
  });

  // Edit handler
  const handleEdit = (item) => {
    navigate(`/mock/full/${item._id}`, {
      state: {
        from: location.pathname,
        api: "/test/mock/full",
        uniquePart: item._id,
      },
    });
  };

  // Delete handler
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

  // Add mock test
  const handleAddMockTest = () => {
    navigate("/mock/full/add", {
      state: {
        from: location.pathname,
        api: "/test/mock/full",
        type: "mock",
        subtype: "full",
      },
    });
  };

  // Format duration to string like "02:30"
  const formatDuration = (duration) => {
    if (!duration) return "--";
    const hours = duration.hours?.toString().padStart(2, "0") || "00";
    const minutes = duration.minutes?.toString().padStart(2, "0") || "00";
    return `${hours}:${minutes}`;
  };

  return (
    <div className="max-w-full min-h-screen mx-auto bg-[#f6f6f7]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#a91e22] to-[#811b1c]"> 
        <h1 className="text-2xl font-semibold text-white tracking-wide">
          Full Mock Test
        </h1>
        <Button
          onClick={handleAddMockTest}
          className="bg-[#a91e22] hover:bg-[#811b1c] text-white px-6 py-2 rounded-lg text-base font-semibold border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Mock-Test
        </Button>
      </div>

      {/* Content */}
      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a91e22]" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-[#a91e22]">
            {error?.message || "An error occurred"}
          </div>
        ) : (
          <div className="space-y-4">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-5 border border-[#e5e2e5] rounded-lg bg-[#faf8fa] shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 w-full">
                    <span className="text-[#a91e22] font-semibold min-w-[90px]">
                      #{item._id}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="font-medium text-base text-[#333] flex-1">
                      {item.name}
                    </span>
                    {/* No questions in this API response, so omit questions */}
                    <span className="text-gray-500 text-sm ml-6">
                      Approx. Time : {formatDuration(item.duration)} hours
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-4 text-gray-400 hover:text-[#a91e22] p-2 rounded">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 z-[100]">
                      {/* <DropdownMenuItem
                        onClick={() => handleEdit(item)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => handleDelete(item)}
                        className="cursor-pointer text-[#a91e22] hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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