import React, { useState } from "react";
import { BsUpload } from "react-icons/bs";
import { MdDelete } from "react-icons/md";

const AudioInput = ({ audio, setAudio }) => {
  const [audioUrl, setAudioUrl] = useState(""); // Audio file URL for preview

  const handleUploadAudio = () => {
    document.getElementById("audio_input").click();
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    
    if (file) {
      // Check file type and create object URL
      if (file.type.startsWith("audio/")) {
        const audioURL = URL.createObjectURL(file);
        setAudio(file);  // Set the entire file object
        setAudioUrl(audioURL); // Set the URL for audio preview
      } else {
        alert("Please upload a valid audio file");
      }
    }
  };

  const handleUploadFile = async () => {
    // Assuming you will handle file upload logic here (server-side)
    console.log("Audio file to upload: ", audio);
  };

  return (
    <div className="p-8 mb-4 flex items-center flex-col gap-5 justify-center">
      {audio === "" ? (
        <div className="text-center w-full md:w-[90%]">
          <input
            type="file"
            name="audio"
            id="audio_input"
            className="hidden"
            onChange={handleFileChange}
          />
          <h1 className="text-[1.5rem] dark:text-[#abc2d3] text-text font-[600]">
            Upload your audio files
          </h1>
          <p className="text-[#777777] dark:text-[#abc2d3]/80 font-[400] text-[1rem]">
            MP3, WAV, AAC, FLAC, M4A, OGG, and WMA formats are supported.
          </p>

          <div
            className="mt-5 w-full md:w-[70%] mx-auto dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center flex-col bg-white border-[2px] border-dashed border-[#3B9DF8] rounded-md py-10 cursor-pointer"
            onClick={handleUploadAudio}
          >
            <BsUpload className="text-[4rem] text-[#424242] dark:text-[#abc2d3]/70" />
          </div>
        </div>
      ) : (
        <div className="relative w-full md:w-[80%]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[1.2rem]">{audio.name}</h2>
            <MdDelete
              className="text-[2rem] text-white bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-700 transition duration-300 ease-in-out"
              onClick={() => {
                setAudio(null);
                setAudioUrl("");
              }}
            />
          </div>

          {/* Audio Player for Preview */}
          <audio controls className="w-full">
            <source src={audioUrl} type={audio.type} />
            Your browser does not support the audio element.
          </audio>

          {/* Upload Button */}
          <button onClick={handleUploadFile} className="mt-3 text-white bg-blue-500 px-4 py-2 rounded-md">
            Upload Audio
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioInput;
