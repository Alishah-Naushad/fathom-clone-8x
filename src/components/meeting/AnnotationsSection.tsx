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
    <div className="flex flex-col gap-2.5 pt-2 pb-4">
      {/* Header with Internal Team Only lock badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold tracking-wider text-[#80858e] uppercase">
          ANNOTATIONS
        </h3>
        <span className="flex items-center gap-1 bg-[#2f2b1d] text-[#eab308] border border-[#eab308]/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          INTERNAL TEAM ONLY
        </span>
      </div>

      {highlights.length === 0 ? (
        <div className="bg-[#202126] rounded-md p-3 text-center border border-[#2c2e35]">
          <p className="text-xs text-[#80858e] italic">
            No highlights recorded yet. Add from transcript tab.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {highlights.map((h) => {
            const timeSeconds = h.line_timestamp_seconds ?? 34;
            const timeLabel = `${timeSeconds}s`;

            return (
              <div
                key={h.id}
                onClick={() => onJumpToTime?.(timeSeconds)}
                className="group flex items-start gap-2.5 p-2 rounded bg-[#202126] hover:bg-[#272830] border border-[#2b2d35] hover:border-[#00beff]/40 transition-colors cursor-pointer"
              >
                {/* Video Play Icon Box */}
                <div className="mt-0.5 w-4 h-4 rounded bg-[#1b2b38] border border-[#00beff]/40 flex items-center justify-center text-[#00beff] group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#00beff] group-hover:underline">
                      Highlight
                    </span>
                    <span className="text-xs text-[#80858e] font-mono">
                      - {timeLabel}
                    </span>
                  </div>
                  {h.note && (
                    <p className="text-xs text-white/85 leading-relaxed">
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
