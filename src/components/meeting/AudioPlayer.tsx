"use client";

import React, { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  currentTime: number;
  onTimeChange?: (time: number) => void;
}

export default function AudioPlayer({
  audioUrl,
  title,
  currentTime,
  onTimeChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  // Keep the <audio> element's actual playback position in sync with
  // currentTime when it changes from OUTSIDE this component (e.g. clicking
  // a transcript line jumps the audio).
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(playbackSpeed.replace("x", "")) || 1;
    }
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeChange?.(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onTimeChange?.(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speeds = ["0.75x", "1x", "1.25x", "1.5x", "2x"];

  return (
    <div className="relative w-full rounded-md overflow-hidden bg-[#18191c] border border-[#2b2c32] shadow-2xl flex flex-col">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Simple audio-only "cover" area, no video/thumbnail pretense */}
      <div className="relative w-full h-32 bg-[#141518] flex items-center justify-center">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-16 h-16 rounded-full bg-[#00beff]/10 border border-[#00beff]/40 flex items-center justify-center text-[#00beff] hover:scale-110 hover:bg-[#00beff]/20 transition-all cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/70 truncate max-w-[70%]">
          {title}
        </span>
      </div>

      {/* Controls bar — same layout language as your existing player */}
      <div className="w-full bg-[#212124] px-4 py-2.5 flex items-center gap-4 select-none border-t border-[#2a2b31]">
        <span className="text-xs font-mono font-medium text-white/90 whitespace-nowrap min-w-[36px]">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#3a3c44] rounded-lg appearance-none cursor-pointer accent-[#00beff] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #00beff ${(currentTime / (duration || 1)) * 100}%, #3a3c44 ${(currentTime / (duration || 1)) * 100}%)`,
          }}
        />

        <span className="text-xs font-mono text-[#80858e] whitespace-nowrap">
          {formatTime(duration)}
        </span>

        <div className="relative">
          <button
            onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
            className="text-xs font-semibold text-white/90 hover:text-white bg-[#2d2e35] px-2 py-1 rounded transition-colors cursor-pointer"
          >
            {playbackSpeed}
          </button>
          {speedMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#2a2b30] border border-[#383a42] rounded shadow-xl py-1 z-30 min-w-[64px]">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-center px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    playbackSpeed === s
                      ? "text-[#00beff] bg-[#33353c]"
                      : "text-white/80 hover:bg-[#33353c] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}