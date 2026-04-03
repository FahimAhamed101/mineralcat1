import { useState } from "react";
import fetchWithAuth from "../../../utils/fetchWithAuth";

const TEMPLATE_ITEMS = [
  {
    key: "describe-image",
    title: "Describe Image",
    endpoint: "/templates/describe-image",
  },
  {
    key: "respond-to-situation",
    title: "Respond to Situation",
    endpoint: "/templates/respond-to-situation",
  },
  {
    key: "write-email",
    title: "Write Email",
    endpoint: "/templates/write-email",
  },
  {
    key: "summarize-spoken-text",
    title: "Summarize Spoken Text",
    endpoint: "/templates/summarize-spoken-text",
  },
];

const FILE_FIELD = "file";

const buildInitialState = () =>
  TEMPLATE_ITEMS.reduce((acc, item) => {
    acc[item.key] = {
      file: null,
      currentName: "",
      status: "",
      loading: false,
    };
    return acc;
  }, {});

export default function Templates() {
  const [itemsState, setItemsState] = useState(buildInitialState);
  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

  const updateItemState = (key, next) => {
    setItemsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...next,
      },
    }));
  };

  const handleFileChange = (key, file) => {
    updateItemState(key, { file, status: "" });
  };

  const handleUpload = async (item) => {
    const state = itemsState[item.key];
    if (!state.file) {
      updateItemState(item.key, { status: "Please select a PDF first." });
      return;
    }

    if (!baseUrl) {
      updateItemState(item.key, { status: "Base URL is not configured." });
      return;
    }

    updateItemState(item.key, { loading: true, status: "" });

    try {
      const formData = new FormData();
      formData.append(FILE_FIELD, state.file);

      const response = await fetchWithAuth(`${baseUrl}${item.endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response?.ok) {
        throw new Error("Upload failed");
      }

      let uploadedName = state.file.name;
      try {
        const data = await response.json();
        uploadedName =
          data?.fileName ||
          data?.filename ||
          data?.name ||
          data?.data?.fileName ||
          uploadedName;
      } catch (error) {
        // Ignore non-JSON responses
      }

      updateItemState(item.key, {
        file: null,
        currentName: uploadedName,
        status: "Upload successful.",
        loading: false,
      });
    } catch (error) {
      updateItemState(item.key, {
        status: "Upload failed. Please try again.",
        loading: false,
      });
    }
  };

  const handleDelete = async (item) => {
    if (!baseUrl) {
      updateItemState(item.key, { status: "Base URL is not configured." });
      return;
    }

    updateItemState(item.key, { loading: true, status: "" });

    try {
      const response = await fetchWithAuth(`${baseUrl}${item.endpoint}`, {
        method: "DELETE",
      });

      if (!response?.ok) {
        throw new Error("Delete failed");
      }

      updateItemState(item.key, {
        currentName: "",
        status: "Template deleted.",
        loading: false,
      });
    } catch (error) {
      updateItemState(item.key, {
        status: "Delete failed. Please try again.",
        loading: false,
      });
    }
  };

  return (
    <div className="w-full lg:max-w-[92%] mx-auto py-6">
      <div className="rounded-2xl border border-[#E6D3D3] bg-white shadow-sm">
        <div className="rounded-t-2xl bg-gradient-to-r from-[#7D0000] to-[#973333] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Templates</h2>
          <p className="mt-1 text-sm text-[#F2E6E6]">
            Upload one PDF per category. These files show in the user templates
            page.
          </p>
        </div>

        <div className="grid gap-4 p-6">
          {TEMPLATE_ITEMS.map((item) => {
            const state = itemsState[item.key];

            return (
              <div
                key={item.key}
                className="rounded-xl border border-[#E6D3D3] bg-[#FFF8F8] p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3A0B0B]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#6B2A2A]">
                      PDF only. Single file per category.
                    </p>
                    {state.currentName ? (
                      <p className="mt-1 text-sm text-[#7D0000]">
                        Current file: {state.currentName}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-[#6B2A2A]">
                        No file uploaded yet.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(event) =>
                        handleFileChange(item.key, event.target.files?.[0])
                      }
                      className="w-full rounded-lg border border-[#E6D3D3] bg-white px-3 py-2 text-sm text-[#3A0B0B]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpload(item)}
                        disabled={state.loading}
                        className="rounded-md bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6B0000] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {state.loading ? "Working..." : "Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={state.loading}
                        className="rounded-md border border-[#8B0000] px-4 py-2 text-sm font-semibold text-[#8B0000] transition hover:bg-[#F2E6E6] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {state.status ? (
                  <p className="mt-3 text-sm text-[#7D0000]">{state.status}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
