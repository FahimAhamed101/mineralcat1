import { useEffect, useId, useRef, useState } from "react";
import { BsUpload } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_IMAGE_EXTENSIONS,
  ...ACCEPTED_IMAGE_TYPES,
].join(",");

function getFileExtension(fileName = "") {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function getImageName(image) {
  if (image instanceof File) return image.name;
  if (typeof image === "string" && image) {
    try {
      return (
        decodeURIComponent(image.split("/").pop()?.split("?")[0] || "") ||
        "Image file"
      );
    } catch {
      return image.split("/").pop()?.split("?")[0] || "Image file";
    }
  }

  return "";
}

function isAcceptedImageFile(file) {
  if (!file) return false;

  const extension = getFileExtension(file.name);
  const type = String(file.type || "").toLowerCase();

  return (
    ACCEPTED_IMAGE_EXTENSIONS.includes(extension) ||
    ACCEPTED_IMAGE_TYPES.includes(type)
  );
}

export default function ImageInput({ image, setImage }) {
  const inputId = useId();
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const hasImage = Boolean(image);
  const imageName = getImageName(image);

  useEffect(() => {
    if (!image) {
      setImageUrl("");
      return undefined;
    }

    if (typeof image === "string") {
      setImageUrl(image);
      return undefined;
    }

    const nextImageUrl = URL.createObjectURL(image);
    setImageUrl(nextImageUrl);

    return () => URL.revokeObjectURL(nextImageUrl);
  }, [image]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetFileInput();
      return;
    }

    if (!isAcceptedImageFile(file)) {
      toast.error("Please upload a JPG, PNG, or WebP image file.");
      resetFileInput();
      return;
    }

    setImage(file);
    resetFileInput();
  };

  const handleRemoveImage = () => {
    setImage("");
    setImageUrl("");
    resetFileInput();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-0 sm:px-4 py-8">
      <input
        ref={fileInputRef}
        type="file"
        name="image"
        id={inputId}
        className="hidden"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleFileChange}
      />

      {!hasImage ? (
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold text-gray-900">Upload image</h2>
          <p className="mt-1 text-sm text-gray-500">
            JPG, PNG, and WebP files are supported.
          </p>

          <button
            type="button"
            className="mt-5 w-full max-w-3xl mx-auto flex items-center justify-center flex-col bg-white border-2 border-dashed border-[#3B9DF8] rounded-md py-10 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={openFilePicker}
          >
            <BsUpload className="text-5xl text-[#424242]" />
            <span className="mt-3 text-sm font-medium text-gray-700">
              Choose image file
            </span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="min-w-0 truncate text-lg font-medium text-gray-900">
              {imageName}
            </h2>
            <button
              type="button"
              aria-label="Remove image"
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={handleRemoveImage}
            >
              <MdDelete className="text-xl" />
            </button>
          </div>

          <img
            src={imageUrl}
            alt=""
            className="max-h-80 w-full rounded-md border border-gray-200 object-contain bg-gray-50"
          />

          <button
            type="button"
            onClick={openFilePicker}
            className="mt-3 text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
          >
            Replace Image
          </button>
        </div>
      )}
    </div>
  );
}
