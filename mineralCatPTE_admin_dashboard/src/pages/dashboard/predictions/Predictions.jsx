import { useEffect, useState } from "react";
import fetchWithAuth from "../../../utils/fetchWithAuth";

const FILE_FIELD = "file";

export default function Predictions() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUploadUrl, setLastUploadUrl] = useState("");
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  const loadPredictions = async () => {
    if (!baseUrl) return;
    try {
      const response = await fetchWithAuth(`${baseUrl}/predictions`);
      if (!response?.ok) throw new Error("Failed to fetch predictions");
      const data = await response.json();
      setItems(data?.data || []);
    } catch (error) {
      setMessage("Unable to load predictions.");
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [baseUrl]);

  const handleUpload = async () => {
    setMessage("");
    setLastUploadUrl("");

    if (!name.trim()) {
      setMessage("Please enter a prediction name.");
      return;
    }

    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (!baseUrl) {
      setMessage("Base URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append(FILE_FIELD, file);

      const response = await fetchWithAuth(`${baseUrl}/predictions`, {
        method: "POST",
        body: formData,
      });

      if (!response?.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setName("");
      setFile(null);
      setMessage("Prediction uploaded successfully.");
      setLastUploadUrl(result?.data?.fileUrl || "");
      await loadPredictions();
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    if (!baseUrl) {
      setMessage("Base URL is not configured.");
      return;
    }

    try {
      const response = await fetchWithAuth(`${baseUrl}/predictions/${id}`, {
        method: "DELETE",
      });

      if (!response?.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Prediction deleted.");
      await loadPredictions();
    } catch (error) {
      setMessage("Delete failed. Please try again.");
    }
  };

  return (
    <div className="w-full lg:max-w-[92%] mx-auto py-6">
      <div className="rounded-2xl border border-[#E6D3D3] bg-white shadow-sm">
        <div className="rounded-t-2xl bg-gradient-to-r from-[#7D0000] to-[#973333] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Predictions</h2>
          <p className="mt-1 text-sm text-[#F2E6E6]">
            Add a prediction name and upload a single PDF file.
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-xl border border-[#E6D3D3] bg-[#FFF8F8] p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-[#3A0B0B]">
              Add Prediction
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr,1fr,auto]">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Prediction title"
                className="w-full rounded-lg border border-[#E6D3D3] bg-white px-3 py-2 text-sm text-[#3A0B0B]"
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-[#E6D3D3] bg-white px-3 py-2 text-sm text-[#3A0B0B]"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="rounded-md bg-[#8B0000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6B0000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {message ? (
            <p className="mt-4 text-sm text-[#7D0000]">{message}</p>
          ) : null}
          {lastUploadUrl ? (
            <p className="mt-2 text-sm text-[#3A0B0B]">
              Uploaded URL:{" "}
              <a
                href={lastUploadUrl}
                className="text-[#7D0000] underline"
                target="_blank"
                rel="noreferrer"
              >
                {lastUploadUrl}
              </a>
            </p>
          ) : null}

          <div className="mt-6 grid gap-3">
            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E6D3D3] bg-white px-4 py-6 text-sm text-[#6B2A2A]">
                No predictions uploaded yet.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-3 rounded-xl border border-[#E6D3D3] bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-[#3A0B0B]">
                      {item.name}
                    </p>
                  <p className="text-sm text-[#6B2A2A]">
                    {item.originalName || "PDF file"}
                  </p>
                  {item.fileUrl ? (
                    <a
                      href={item.fileUrl}
                      className="text-xs text-[#7D0000] underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View file URL
                    </a>
                  ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded-md border border-[#8B0000] px-4 py-2 text-sm font-semibold text-[#8B0000] transition hover:bg-[#F2E6E6]"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
