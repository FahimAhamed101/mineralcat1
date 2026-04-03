/* eslint-disable no-unused-vars */
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchWithAuth from "../../../../../utils/fetchWithAuth";
import { Button } from "../../../../../components/ui/button";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";

export default function AllMockTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  // Fetch sectional mock tests (NO pagination)
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["sectionalMockTests"],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `${baseUrl}/sectional-mock-test/getAll/speaking`
      );
      const json = await response.json();
      if (json && Array.isArray(json.sectionalMockTests)) {
        return json.sectionalMockTests;
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
    mutationFn: async (id) => {
      const response = await fetchWithAuth(
        `${baseUrl}/sectional-mock-test/delete/${id}`,
        { method: "DELETE" }
      );
      const json = await response.json();
      if (!response.ok || json?.status === false) {
        throw new Error(json?.message || "Failed to delete");
      }
      return true;
    },
    onSuccess: () => {
      refetch();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Mock test has been deleted.",
        timer: 1300,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error?.message || "Failed to delete mock test.",
      });
    },
  });

  // Delete handler with sweetalert confirmation
  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#a91e22",
      cancelButtonColor: "#bbb",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(item._id);
      }
    });
  };

  // Format duration to string like "02:30"
  const formatDuration = (duration) => {
    if (!duration) return "--";
    // Fix: if minutes > 59, convert to hours
    let hours = Number(duration.hours) || 0;
    let minutes = Number(duration.minutes) || 0;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="max-w-full min-h-screen mx-auto bg-[#f6f6f7]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#a91e22] to-[#811b1c]">
        <h1 className="text-2xl font-semibold text-white tracking-wide">
          Sectional Mock Test
        </h1>
        <div>
          <Button
            variant="outline"
            className="text-white border-white bg-[#a91e22] hover:text-white transition-colors"
            onClick={() => navigate("/mock/speaking-tests/add")}
          >
            <Plus className="mr-2" />
            Add Mock Test
          </Button>
        </div>
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
                    <span className="text-gray-500 text-sm ml-6">
                      Approx. Time : {formatDuration(item.duration)} hours
                    </span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      className="hover:bg-red-50 text-[#a91e22]"
                      size="icon"
                      onClick={() => handleDelete(item)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
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