import React, { useRef, useState } from "react";

export default function AudioPlayer({ src }) {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const format = (s) => {
    if (isNaN(s)) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const v = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = v;
      setProgress(v);
    }
  };

  const handleVolume = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(e.target.value);
    }
  };

  return (
    <div className="w-full flex items-center gap-3 flex-wrap md:flex-nowrap">
      <button
        className="w-12 h-12 rounded-full flex items-center justify-center shadow bg-[#810000] text-white hover:bg-[#5d0000] mr-3"
        onClick={handlePlayPause}
        aria-label={playing ? "Pause audio" : "Play audio"}
        style={{ minWidth: 48 }}
        type="button"
      >
        {playing ? (
          // Pause icon
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor" /><rect x="14" y="5" width="4" height="14" fill="currentColor" /></svg>
        ) : (
          // Play icon
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
        )}
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        style={{ display: "none" }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <span className="text-xs text-gray-600" style={{ minWidth: 100 }}>
        {format(progress)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={progress}
        onChange={handleSeek}
        className="flex-1 accent-[#810000] h-2 mx-2 w-fit"
        // style={{ minWidth: 60, maxWidth: 400 }}
      />
      <span className="text-xs text-gray-600" style={{ minWidth: 50 }}>
        {format(duration)}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        defaultValue={1}
        onChange={handleVolume}
        className="w-24 accent-[#810000] ml-2"
      />
    </div>
  );
}