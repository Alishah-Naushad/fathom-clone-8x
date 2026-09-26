"use client";

import React from "react";

export interface HighlightItem {
  id: string;
  meeting_id: string;
  transcript_line_id: string;
  note?: string | null;
  line_timestamp_seconds?: number;
}

interface AnnotationsSectionProps {
  highlights: HighlightItem[];
  onJumpToTime?: (seconds: number) => void;
}

export default function AnnotationsSection({
  highlights = [],
  onJumpToTime,
}: AnnotationsSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 pb-2">
      {/* Header with Internal Team Only lock badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            HIGHLIGHTS
          </h3>
        </div>
        <span className="flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          TEAM ONLY
        </span>
      </div>

      {highlights.length === 0 ? (
        <div className="bg-[#121422] rounded-xl p-3.5 text-center border border-indigo-500/15">
          <p className="text-xs text-slate-400 italic">
            No highlights bookmarked yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {highlights.map((h) => {
            const timeSeconds = h.line_timestamp_seconds ?? 34;
            const timeLabel = `${Math.floor(timeSeconds / 60)}:${(timeSeconds % 60).toString().padStart(2, "0")}`;

            return (
              <div
                key={h.id}
                onClick={() => onJumpToTime?.(timeSeconds)}
                className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-[#131523] hover:bg-[#181b2d] border border-indigo-500/15 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              >
                {/* Voice Play Icon Box */}
                <div className="mt-0.5 w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-cyan-300 group-hover:underline">
                      Moment
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      [{timeLabel}]
                    </span>
                  </div>
                  {h.note && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {h.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
