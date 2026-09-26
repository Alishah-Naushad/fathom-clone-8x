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
    <div className="relative w-full rounded-xl overflow-hidden bg-[#10121d] border border-indigo-500/20 shadow-2xl flex flex-col group">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Audio Cover Area with Hearken Visualizer */}
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#121424] via-[#161a30] to-[#0b0c16] overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.2),transparent_70%)]" />

        {/* Subtle Grid Texture */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10121d] via-transparent to-black/30 pointer-events-none" />

        {/* Centered Hearken Logo Visualizer */}
        <div className="relative z-10 flex flex-col items-center gap-3 mb-3">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0d0f1c]/90 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <div className="flex items-center gap-1 h-8">
              <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isPlaying ? "voice-wave-bar" : "h-4"}`} />
              <span className={`w-1 bg-indigo-400 rounded-full transition-all ${isPlaying ? "voice-wave-bar" : "h-7"}`} />
              <span className={`w-1 bg-cyan-300 rounded-full transition-all ${isPlaying ? "voice-wave-bar" : "h-5"}`} />
              <span className={`w-1 bg-purple-400 rounded-full transition-all ${isPlaying ? "voice-wave-bar" : "h-3"}`} />
            </div>
          </div>
          <span className="text-xs font-black tracking-[0.3em] text-slate-300 uppercase">
            HEARKEN AUDIO
          </span>
        </div>

        {/* Center Play / Pause Pulsing Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md shadow-2xl ${
            isPlaying
              ? "bg-black/60 border border-cyan-400/30 hover:scale-105"
              : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:scale-110 shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-300/40"
          }`}
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
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
          <span>{isPlaying ? "Playing Audio" : "Audio Recording"}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="w-full bg-[#121422] px-5 py-3 flex items-center gap-4 select-none border-t border-indigo-500/15">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
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

        {/* Current Time */}
        <span className="text-xs font-mono font-medium text-cyan-300 whitespace-nowrap min-w-[36px]">
          {formatTime(currentTime)}
        </span>

        {/* Scrub Bar */}
        <div className="relative flex-1 flex items-center group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #00f2fe ${(currentTime / (duration || 1)) * 100}%, #1e2238 ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
        </div>

        {/* Duration */}
        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
          {formatTime(duration)}
        </span>

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
      </div>
    </div>
  );
}