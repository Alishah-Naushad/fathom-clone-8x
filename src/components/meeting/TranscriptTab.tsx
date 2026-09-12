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
  const containerRef = useRef<HTMLDivElement>(null);

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
    // Find the last line whose timestamp is <= currentTime
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
      console.error("Failed to create highlight:", err);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 py-3">
      {/* Top Toolbar: Search Transcript, Auto-scroll Toggle & Copy Transcript Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#80858e]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Transcript"
              className="w-full bg-[#202126] text-xs text-white placeholder-[#80858e] pl-8 pr-3 py-1.5 rounded-md border border-[#32343d] focus:outline-none focus:border-[#00beff]/50"
            />
          </div>

          {/* Auto-scroll toggle pill */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border transition-all cursor-pointer select-none ${
              autoScroll
                ? "bg-[#183446] text-[#00beff] border-[#00beff]/40 shadow-xs"
                : "bg-[#202126] text-[#80858e] border-[#32343d] hover:text-white"
            }`}
            title="Automatically scroll transcript as video plays"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoScroll ? "bg-[#00beff] animate-pulse" : "bg-[#80858e]"
              }`}
            />
            <span>Auto-scroll</span>
          </button>
        </div>

        {/* Copy Transcript Button */}
        <button
          onClick={handleCopyTranscript}
          className="flex items-center gap-1.5 bg-[#1b2b38] hover:bg-[#203648] text-[#00beff] font-semibold text-xs px-3 py-1.5 rounded border border-[#00beff]/30 transition-all cursor-pointer shadow-sm"
        >
          <span>{copied ? "Copied!" : "Copy Transcript"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Transcript Timeline / Lines */}
      {filteredLines.length === 0 ? (
        <div className="py-12 text-center text-[#80858e] text-xs">
          No matching transcript lines found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredLines.map((line) => {
            const isHighlighted = highlightLineIds.includes(line.id);
            const isActive = activeLineId === line.id;

            return (
              <div
                key={line.id}
                ref={(el) => {
                  lineRefs.current[line.id] = el;
                }}
                className={`flex flex-col gap-1 group/line rounded-lg transition-all duration-300 ${
                  isActive ? "scale-[1.008]" : ""
                }`}
              >
                {/* Speaker & Timestamp */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onJumpToTime?.(line.timestamp_seconds)}
                    className={`text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#00beff] font-bold"
                        : "text-[#80858e] hover:text-[#00beff]"
                    }`}
                  >
                    [{formatTimestamp(line.timestamp_seconds)}]
                  </button>
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-white" : "text-white/85"
                    }`}
                  >
                    {line.speaker}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-[#00beff] bg-[#183446] px-1.5 py-0.2 rounded font-semibold animate-pulse">
                      Playing
                    </span>
                  )}
                </div>

                {/* Highlight Tag header if highlighted */}
                {isHighlighted && (
                  <div className="flex items-center gap-1.5 text-[#00beff] text-[11px] font-bold pl-2 pt-1">
                    <svg className="w-3 h-3 text-[#00beff]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                    <span>HIGHLIGHT · Highlight</span>
                  </div>
                )}

                {/* Speech Bubble & Action icons */}
                <div className="flex items-start gap-2">
                  {/* Quick Add Highlight Button (+) */}
                  <button
                    onClick={() => setHighlightModalLineId(line.id)}
                    className="opacity-0 group-hover/line:opacity-100 mt-1 p-1 rounded-full bg-[#2a2c33] hover:bg-[#00beff] hover:text-black text-white/70 transition-all cursor-pointer"
                    title="Add Highlight Note"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* Bubble */}
                  <div
                    onClick={() => onJumpToTime?.(line.timestamp_seconds)}
                    className={`flex-1 p-3 rounded-lg text-xs leading-relaxed transition-all cursor-pointer ${
                      isHighlighted
                        ? "bg-[#0284c7] text-white border-l-4 border-[#00beff] shadow-md"
                        : isActive
                        ? "bg-[#282b34] text-white ring-2 ring-[#00beff]/60 border-l-4 border-[#00beff] shadow-lg"
                        : "bg-[#202126] text-white/90 hover:bg-[#262830] border border-[#2b2c34]"
                    }`}
                  >
                    {line.text}
                  </div>
                </div>

                {/* Highlight Creation Modal */}
                {highlightModalLineId === line.id && (
                  <div className="mt-2 p-3 bg-[#1e2025] rounded-md border border-[#373942] flex flex-col gap-2">
                    <span className="text-xs font-semibold text-[#00beff]">
                      Add Highlight Note
                    </span>
                    <input
                      type="text"
                      value={highlightNote}
                      onChange={(e) => setHighlightNote(e.target.value)}
                      placeholder="Enter a brief note for this highlight..."
                      className="bg-[#2a2c33] text-xs text-white p-2 rounded border border-[#3e404b] focus:outline-none focus:border-[#00beff]"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setHighlightModalLineId(null)}
                        className="text-xs text-[#80858e] hover:text-white px-2 py-1 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateHighlight(line.id)}
                        className="text-xs font-bold bg-[#00beff] text-black px-3 py-1 rounded hover:bg-[#00a8e6] cursor-pointer"
                      >
                        Save Highlight
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
