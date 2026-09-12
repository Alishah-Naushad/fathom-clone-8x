"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  thumbnailUrl?: string;
  durationMinutes: number;
  currentTime: number;
  onTimeChange?: (time: number) => void;
  title: string;
}

export default function VideoPlayer({
  thumbnailUrl = "/test-call-thumb.png",
  durationMinutes,
  currentTime,
  onTimeChange,
  title,
}: VideoPlayerProps) {
  const totalSeconds = Math.max(durationMinutes * 60, 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const speedMultiplier = parseFloat(playbackSpeed.replace("x", "")) || 1;
      timerRef.current = setInterval(() => {
        onTimeChange?.(
          Math.min(currentTime + 1, totalSeconds)
        );
      }, 1000 / speedMultiplier);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTime, totalSeconds, playbackSpeed, onTimeChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onTimeChange?.(newTime);
  };

  const speeds = ["0.75x", "1x", "1.25x", "1.5x", "2x"];

  return (
    <div className="relative w-full rounded-md overflow-hidden bg-[#18191c] border border-[#2b2c32] shadow-2xl flex flex-col group">
      {/* Video / Thumbnail Surface */}
      <div className="relative aspect-[16/9] w-full bg-[#141518] overflow-hidden flex items-center justify-center">
        <Image
          src={thumbnailUrl || "/test-call-thumb.png"}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
          priority
        />

        {/* Center Play Button Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Video" : "Play Video"}
          className="absolute z-10 w-16 h-16 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/90 hover:text-white hover:scale-110 hover:bg-black/70 transition-all cursor-pointer shadow-lg"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Floating duration indicator badge */}
        {!isPlaying && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-semibold text-white/90 flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-[#00beff] animate-pulse" />
            <span>{durationMinutes} min</span>
          </div>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="w-full bg-[#212124] px-4 py-2.5 flex items-center gap-4 select-none border-t border-[#2a2b31]">
        {/* Play / Pause button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="text-white hover:text-[#00beff] transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Timestamp */}
        <span className="text-xs font-mono font-medium text-white/90 whitespace-nowrap min-w-[36px]">
          {formatTime(currentTime)}
        </span>

        {/* Interactive Scrub Bar */}
        <div className="relative flex-1 flex items-center group/scrub">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#3a3c44] rounded-lg appearance-none cursor-pointer accent-[#00beff] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #00beff ${(currentTime / totalSeconds) * 100}%, #3a3c44 ${(currentTime / totalSeconds) * 100}%)`,
            }}
          />
        </div>

        {/* Speed Selector */}
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

        {/* Fullscreen icon */}
        <button
          className="text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Fullscreen"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
