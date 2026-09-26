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
    <div className="relative w-full rounded-xl overflow-hidden bg-[#10121d] border border-indigo-500/20 shadow-2xl flex flex-col group">
      {/* Video / Thumbnail Surface */}
      <div className="relative aspect-[16/9] w-full bg-[#090a12] overflow-hidden flex items-center justify-center">
        <Image
          src={thumbnailUrl || "/test-call-thumb.png"}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          priority
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10121d] via-transparent to-black/30" />

        {/* Center Play / Pause Pulsing Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Video" : "Play Video"}
          className={`absolute z-10 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md shadow-2xl ${
            isPlaying
              ? "bg-black/60 border border-white/20 hover:scale-105"
              : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:scale-110 shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-300/40"
          }`}
        >
          {isPlaying ? (
            <svg className="w-7 h-7 text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Floating Meeting Recording Badge */}
        <div className="absolute top-4 left-4 bg-[#090a12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-2 shadow-lg">
          <div className="flex items-center gap-[2px] h-3.5">
            <span className={`w-[2.5px] bg-cyan-400 rounded-full ${isPlaying ? "voice-wave-bar" : "h-1.5"}`} />
            <span className={`w-[2.5px] bg-indigo-400 rounded-full ${isPlaying ? "voice-wave-bar" : "h-3"}`} />
            <span className={`w-[2.5px] bg-cyan-300 rounded-full ${isPlaying ? "voice-wave-bar" : "h-2"}`} />
            <span className={`w-[2.5px] bg-purple-400 rounded-full ${isPlaying ? "voice-wave-bar" : "h-1"}`} />
          </div>
          <span>{isPlaying ? "Playing Recording" : `${durationMinutes}m Meeting`}</span>
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="w-full bg-[#121422] px-5 py-3 flex items-center gap-4 select-none border-t border-indigo-500/15">
        {/* Play / Pause button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Timestamp */}
        <span className="text-xs font-mono font-medium text-cyan-300 whitespace-nowrap min-w-[36px]">
          {formatTime(currentTime)}
        </span>

        {/* Interactive Scrub Bar with Electric Cyan Gradient */}
        <div className="relative flex-1 flex items-center group/scrub">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #00f2fe ${(currentTime / totalSeconds) * 100}%, #1e2238 ${(currentTime / totalSeconds) * 100}%)`,
            }}
          />
        </div>

        {/* Speed Selector */}
        <div className="relative">
          <button
            onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
            className="text-xs font-semibold text-slate-200 hover:text-cyan-300 bg-[#1c2033] hover:bg-[#232840] border border-indigo-500/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {playbackSpeed}
          </button>
          {speedMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#16192a] border border-indigo-500/30 rounded-lg shadow-2xl py-1 z-30 min-w-[72px] backdrop-blur-md">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-center px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    playbackSpeed === s
                      ? "text-cyan-300 bg-cyan-950/40 font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
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
          className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
