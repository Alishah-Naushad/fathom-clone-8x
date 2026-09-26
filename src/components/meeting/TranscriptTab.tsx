"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface TranscriptLine {
  id: string;
  meeting_id: string;
  speaker: string;
  timestamp_seconds: number;
  text: string;
  line_order: number;
}

interface TranscriptTabProps {
  meetingId: string;
  lines: TranscriptLine[];
  highlightLineIds?: string[];
  currentTime: number;
  onJumpToTime?: (seconds: number) => void;
  onHighlightCreated?: (lineId: string, note: string) => void;
}

export default function TranscriptTab({
  meetingId,
  lines = [],
  highlightLineIds = [],
  currentTime,
  onJumpToTime,
  onHighlightCreated,
}: TranscriptTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [highlightModalLineId, setHighlightModalLineId] = useState<string | null>(null);
  const [highlightNote, setHighlightNote] = useState("");

  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const formatTimestamp = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines;
    const query = searchQuery.toLowerCase();
    return lines.filter(
      (l) =>
        l.text.toLowerCase().includes(query) ||
        l.speaker.toLowerCase().includes(query)
    );
  }, [lines, searchQuery]);

  // Find currently active speaking line based on currentTime
  const activeLineId = useMemo(() => {
    if (lines.length === 0) return null;
    const pastLines = lines.filter((l) => l.timestamp_seconds <= currentTime);
    if (pastLines.length > 0) {
      return pastLines[pastLines.length - 1].id;
    }
    return lines[0].id;
  }, [lines, currentTime]);

  // Auto-scroll to active line smoothly as video progresses
  useEffect(() => {
    if (!autoScroll || !activeLineId || searchQuery.trim()) return;

    const el = lineRefs.current[activeLineId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineId, autoScroll, searchQuery]);

  const handleCopyTranscript = () => {
    const raw = lines
      .map((l) => `[${formatTimestamp(l.timestamp_seconds)}] ${l.speaker}: ${l.text}`)
      .join("\n");
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateHighlight = async (lineId: string) => {
    if (!highlightNote.trim()) return;
    try {
      const { data, error } = await supabase
        .from("highlights")
        .insert({
          meeting_id: meetingId,
          transcript_line_id: lineId,
          note: highlightNote.trim(),
        })
        .select()
        .single();

      if (!error && data) {
        onHighlightCreated?.(lineId, highlightNote.trim());
        setHighlightModalLineId(null);
        setHighlightNote("");
      }
    } catch (err) {
      console.error("Failed to save highlight:", err);
    }
  };

  // Generate consistent gradient avatar colors based on speaker name
  const getSpeakerAvatarColor = (speaker: string) => {
    const gradients = [
      "from-cyan-500 to-blue-600",
      "from-indigo-500 to-purple-600",
      "from-pink-500 to-rose-600",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
    ];
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) hash += speaker.charCodeAt(i);
    return gradients[hash % gradients.length];
  };

  return (
    <div className="flex flex-col gap-4 py-3">
      {/* Search & Action Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter dialogue & speakers..."
            className="w-full bg-[#131522] text-xs text-slate-100 placeholder-slate-400 pl-8 pr-3 py-2 rounded-lg border border-indigo-500/20 focus:outline-none focus:border-cyan-400"
          />
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              autoScroll
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/30"
                : "bg-[#131522] text-slate-400 border-indigo-500/20"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoScroll ? "bg-cyan-400 animate-pulse" : "bg-slate-500"}`} />
            <span>Auto-follow</span>
          </button>

          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 bg-[#141624] hover:bg-[#1a1e30] text-slate-300 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer shadow-sm"
          >
            <span>{copied ? "Copied!" : "Copy Text"}</span>
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Transcript List Container */}
      <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-2 scroll-smooth">
        {filteredLines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No dialogue matching "{searchQuery}"
          </div>
        ) : (
          filteredLines.map((line) => {
            const isActive = line.id === activeLineId;
            const isHighlighted = highlightLineIds.includes(line.id);

            return (
              <div
                key={line.id}
                ref={(el) => {
                  lineRefs.current[line.id] = el;
                }}
                className={`group/line relative flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? "bg-[#141829] border-cyan-500/50 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30"
                    : isHighlighted
                    ? "bg-[#1b1c28] border-amber-500/40"
                    : "bg-[#10121d]/70 hover:bg-[#151726] border-indigo-500/10 hover:border-indigo-500/30"
                }`}
              >
                {/* Speaker Header + Timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Speaker Avatar Pill */}
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getSpeakerAvatarColor(line.speaker)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                      {line.speaker.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-100">{line.speaker}</span>

                    {/* Active Voice Playing Indicator */}
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>Speaking</span>
                      </span>
                    )}
                  </div>

                  {/* Click to Seek Timestamp Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onJumpToTime?.(line.timestamp_seconds)}
                      className="text-xs font-mono font-semibold text-slate-400 hover:text-cyan-300 bg-[#17192a] hover:bg-cyan-950/40 px-2 py-0.5 rounded border border-indigo-500/20 hover:border-cyan-500/40 transition-colors cursor-pointer"
                      title="Seek to this moment"
                    >
                      {formatTimestamp(line.timestamp_seconds)}
                    </button>

                    {/* Create Highlight Button */}
                    <button
                      onClick={() => setHighlightModalLineId(line.id)}
                      className="opacity-0 group-hover/line:opacity-100 text-[11px] text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                      title="Add note / highlight"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Spoken Text */}
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {line.text}
                </p>

                {/* Highlight Inline Creator Form */}
                {highlightModalLineId === line.id && (
                  <div className="mt-2 pl-8 flex gap-2">
                    <input
                      type="text"
                      value={highlightNote}
                      onChange={(e) => setHighlightNote(e.target.value)}
                      placeholder="Add an internal team note..."
                      className="flex-1 bg-[#181a2b] text-xs text-slate-100 px-3 py-1.5 rounded-lg border border-indigo-500/30 focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                    <button
                      onClick={() => handleCreateHighlight(line.id)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setHighlightModalLineId(null);
                        setHighlightNote("");
                      }}
                      className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1.5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
