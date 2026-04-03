/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import parse from "html-react-parser";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import fetchWithAuth from "../../../utils/fetchWithAuth";

const MySwal = withReactContent(Swal);

export default function Terms() {
  const [termsContent, setTermsContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(`${baseUrl}/terms/terms-action`); 
        if (!res.ok) throw new Error("Failed to fetch terms");
        const data = await res.json();
        const htmlContent =
          data?.termData?.[0]?.termText || "<p>Content not found.</p>";
        setTermsContent(htmlContent);
      } catch (err) {
        setError("Error loading terms and service content.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [baseUrl]);

  const handleEdit = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Do you want to edit the Terms & Service content?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, edit it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/settings/terms/edit");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white px-6 py-4">
        <h1 className="text-xl font-medium">Terms & Service</h1>
      </div>

      {/* Content Area */}
      <div className="bg-white mx-6 mt-6 p-8 rounded-sm shadow-sm relative min-h-96">
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

        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className="fixed bottom-6 right-6 bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg transition-colors z-10"
          aria-label="Edit Terms and Service"
        >
          <Edit size={16} />
          Edit
        </button>
      </div>
    </div>
  );
}
