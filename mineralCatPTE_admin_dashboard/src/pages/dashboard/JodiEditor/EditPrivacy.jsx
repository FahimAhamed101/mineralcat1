/* eslint-disable no-unused-vars */
import React, { useRef, useState, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchWithAuth from "../../../utils/fetchWithAuth";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditPrivacy() {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(true);
  const [id, setId] = useState(null);

  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // fetch privacy data
  useEffect(() => {
    const fetchInitialContent = async () => {
      try {
        setLoadingContent(true);
        const res = await fetchWithAuth(`${baseUrl}/privacy-policy/get-privacy`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch content");
        const data = await res.json();
        setId(data?.policyData?.[0]?._id || null);
        setContent(data?.policyData?.[0]?.policyText || `<b>No privacy policy found</b>`);
      } catch (err) {
        setContent(`<b>API Fetch Failed</b>`);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchInitialContent();
  }, [baseUrl]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!baseUrl) throw new Error("Base URL is not defined");
      if (!id) throw new Error("Privacy Policy ID not set");
      const res = await fetchWithAuth(`${baseUrl}/privacy-policy/privacy-edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyText: data, id }),
      });

      if (!res.ok) {
        let err = null;
        try {
          err = await res.json();
        } catch {
          err = null;
        }
        throw new Error(err?.message || "Failed to save content");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["privacy-content"]);
      toast.success("Privacy policy saved successfully!");
      navigate("/settings/privacy");
    },
    onError: (error) => {
      toast.error("Error saving privacy policy: " + (error.message || ""));
      console.error(error);
    },
  });

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "এখানে তোমার প্রাইভেসি পলিসি লিখো...",
      height: 700,
      textAlign: "left",
      resize: "none",
      toolbarAdaptive: false,
      allowResizeX: false,
      allowResizeY: false,
    }),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(content);
  };

  if (loadingContent) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-[#A85C5C] text-white p-4">
          <h1 className="text-lg font-medium">Editor</h1>
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
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full mx-auto p-4 bg-white rounded shadow flex flex-col"
      style={{ height: "100vh", maxHeight: "100vh" }}
    >
      {/* হেডার */}
      <div className="bg-[#7D0000] text-white p-4 h-[72px] mb-4 flex items-center flex-shrink-0">
        <h1 className="text-xl font-semibold">Privacy Policy Editor</h1>
      </div>

      {/* এডিটর */}
      <div
        className="flex-grow mb-4"
        style={{
          minHeight: 0,
          height: "calc(100vh - 72px - 56px - 32px)",
        }}
      >
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          tabIndex={1}
          onBlur={(newContent) => setContent(newContent)}
          onChange={() => {}}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* সাবমিট বাটন */}
      <div className="flex justify-end flex-shrink-0">
        <button
          type="submit"
          disabled={mutation.isLoading}
          className={`px-6 py-2 rounded text-white ${
            mutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#7D0000] hover:bg-red-900"
          }`}
        >
          {mutation.isLoading ? "Saving..." : "Save Privacy Policy"}
        </button>
      </div>

      {/* মেসেজেস */}
      {mutation.isError && (
        <p className="mt-2 text-red-600">Error: {mutation.error.message}</p>
      )}
      {mutation.isSuccess && (
        <p className="mt-2 text-green-600">Privacy policy saved successfully!</p>
      )}
    </form>
  );
}