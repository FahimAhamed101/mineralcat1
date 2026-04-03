"use client";

import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import fetchWithAuth from "../../lib/fetchWithAuth";

const templateItems = [
  {
    key: "describe-image",
    title: "Describe Image",
    endpoint: "/templates/describe-image",
    fallbackName: "describe-image.pdf",
  },
  {
    key: "respond-to-situation",
    title: "Respond to Situation",
    endpoint: "/templates/respond-to-situation",
    fallbackName: "respond-to-situation.pdf",
  },
  {
    key: "write-email",
    title: "Write Email",
    endpoint: "/templates/write-email",
    fallbackName: "write-email.pdf",
  },
  {
    key: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    endpoint: "/templates/summarize-spoken-text",
    fallbackName: "summarize-spoken-text.pdf",
  },
];

const parseFileName = (contentDisposition, fallbackName) => {
  if (!contentDisposition) return fallbackName;
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  return match?.[1] || fallbackName;
};

export default function TemplatesPage() {
  const [loadingKey, setLoadingKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const handleDownload = async (item) => {
    setErrorMessage("");

    if (!baseUrl) {
      setErrorMessage("Base URL is not configured.");
      return;
    }

    setLoadingKey(item.key);

    try {
      const response = await fetchWithAuth(`${baseUrl}${item.endpoint}`);

      if (!response?.ok) {
        throw new Error(`Download failed (${response?.status || "unknown"})`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const fileName = parseFileName(contentDisposition, item.fallbackName);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage("Unable to download the template right now.");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="w-full bg-gradient-to-r from-[#7D0000] to-[#9B1C1C] py-10 shadow-sm">
        <h1 className="text-center text-3xl font-semibold text-white md:text-4xl">
          Templates
        </h1>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-[#E6D3D3] bg-[#FFF8F8] p-4 md:p-6">
          <div className="grid gap-4">
            {templateItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleDownload(item)}
                disabled={loadingKey === item.key}
                className="flex w-full items-center justify-between rounded-xl border border-[#E6D3D3] bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E6E6] text-[#7D0000]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="text-base font-medium text-[#3A0B0B] md:text-lg">
                    {item.title}
                  </span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7D0000] text-white">
                  <Download className="h-5 w-5" />
                </span>
              </button>
            ))}
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
