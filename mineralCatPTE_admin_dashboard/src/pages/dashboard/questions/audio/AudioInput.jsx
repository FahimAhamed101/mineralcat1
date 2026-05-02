import { useEffect, useId, useRef, useState } from "react";
import { BsUpload } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "video/webm",
];

const ACCEPTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".webm", ".ogg", ".m4a"];
const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_AUDIO_EXTENSIONS,
  ...ACCEPTED_AUDIO_TYPES,
].join(",");

function getFileExtension(fileName = "") {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

function getAudioName(audio) {
  if (audio instanceof File) return audio.name;
  if (typeof audio === "string" && audio) {
    try {
      return decodeURIComponent(audio.split("/").pop()?.split("?")[0] || "Audio file");
    } catch {
      return audio.split("/").pop()?.split("?")[0] || "Audio file";
    }
  }
  return "";
}

function isAcceptedAudioFile(file) {
  if (!file) return false;

  const extension = getFileExtension(file.name);
  const type = String(file.type || "").toLowerCase();

  return (
    ACCEPTED_AUDIO_EXTENSIONS.includes(extension) ||
    ACCEPTED_AUDIO_TYPES.includes(type) ||
    type.startsWith("audio/")
  );
}

const AudioInput = ({ audio, setAudio }) => {
  const inputId = useId();
  const fileInputRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const hasAudio = Boolean(audio);
  const audioName = getAudioName(audio);

  useEffect(() => {
    if (!audio) {
      setAudioUrl("");
      return undefined;
    }

    if (typeof audio === "string") {
      setAudioUrl(audio);
      return undefined;
    }

    const nextAudioUrl = URL.createObjectURL(audio);
    setAudioUrl(nextAudioUrl);

    return () => URL.revokeObjectURL(nextAudioUrl);
  }, [audio]);

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

    if (!isAcceptedAudioFile(file)) {
      toast.error("Please upload an MP3, WAV, WebM, OGG, or M4A audio file.");
      resetFileInput();
      return;
    }

    setAudio(file);
    resetFileInput();
  };

  const handleRemoveAudio = () => {
    setAudio("");
    setAudioUrl("");
    resetFileInput();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-0 sm:px-4 py-8">
      <input
        ref={fileInputRef}
        type="file"
        name="audio"
        id={inputId}
        className="hidden"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleFileChange}
      />

      {!hasAudio ? (
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold text-gray-900">Upload audio</h2>
          <p className="mt-1 text-sm text-gray-500">
            MP3, WAV, WebM, OGG, and M4A files up to 25MB are supported.
          </p>

          <button
            type="button"
            className="mt-5 w-full max-w-3xl mx-auto flex items-center justify-center flex-col bg-white border-2 border-dashed border-[#3B9DF8] rounded-md py-10 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={openFilePicker}
          >
            <BsUpload className="text-5xl text-[#424242]" />
            <span className="mt-3 text-sm font-medium text-gray-700">
              Choose audio file
            </span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="min-w-0 truncate text-lg font-medium text-gray-900">
              {audioName}
            </h2>
            <button
              type="button"
              aria-label="Remove audio"
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={handleRemoveAudio}
            >
              <MdDelete className="text-xl" />
            </button>
          </div>

          <audio controls className="w-full" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>

          <button
            type="button"
            onClick={openFilePicker}
            className="mt-3 text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
          >
            Replace Audio
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioInput;
