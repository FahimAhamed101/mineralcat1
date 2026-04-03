"use client";

import React, { useEffect, useState } from "react";
import { Download, Star } from "lucide-react";
import fetchWithAuth from "../../lib/fetchWithAuth";

const parseFileName = (contentDisposition, fallbackName) => {
  if (!contentDisposition) return fallbackName;
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  return match?.[1] || fallbackName;
};

export default function PredictionsPage() {
  const [loadingKey, setLoadingKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [predictions, setPredictions] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const loadPredictions = async () => {
      if (!baseUrl) return;
      try {
        const response = await fetchWithAuth(`${baseUrl}/predictions`);
        if (!response?.ok) {
          throw new Error("Failed to load predictions");
        }
        const data = await response.json();
        setPredictions(data?.data || []);
      } catch (error) {
        setErrorMessage("Unable to load predictions right now.");
      }
    };

    loadPredictions();
  }, [baseUrl]);

  const handleDownload = async (item) => {
    setErrorMessage("");

    if (!baseUrl) {
      setErrorMessage("Base URL is not configured.");
      return;
    }

    setLoadingKey(item.key);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/predictions/${item._id}`
      );

      if (!response?.ok) {
        throw new Error(`Download failed (${response?.status || "unknown"})`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const fallbackName = `${item.name || "prediction"}.pdf`;
      const fileName = parseFileName(contentDisposition, fallbackName);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage("Unable to download the prediction right now.");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="w-full bg-gradient-to-r from-[#7D0000] to-[#9B1C1C] py-10 shadow-sm">
        <h1 className="text-center text-3xl font-semibold text-white md:text-4xl">
          Predictions
        </h1>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-[#E6D3D3] bg-[#FFF8F8] p-4 md:p-6">
          <div className="grid gap-4">
            {predictions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E6D3D3] bg-white px-4 py-6 text-sm text-[#6B2A2A]">
                No predictions available right now.
              </div>
            ) : (
              predictions.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={loadingKey === item._id}
                  className="flex w-full items-center justify-between rounded-xl border border-[#E6D3D3] bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E6E6] text-[#7D0000]">
                      <Star className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-[#3A0B0B] md:text-base">
                      {item.name}
                    </span>
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E85C8A] text-white">
                    <Download className="h-5 w-5" />
                  </span>
                </button>
              ))
            )}
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
