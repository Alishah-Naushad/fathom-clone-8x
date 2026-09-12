"use client";

import React, { useState } from "react";

interface MeetingHeaderProps {
  title: string;
  meetingDate: string;
  participants?: string[];
  onShare?: () => void;
}

export default function MeetingHeader({
  title,
  meetingDate,
  participants = [],
  onShare,
}: MeetingHeaderProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(meetingDate);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return meetingDate;
    }
  }, [meetingDate]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/share/${window.location.pathname.split("/").pop()}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-[#2a2c32]">
      {/* Title & Date */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <span className="text-xs text-[#80858e] font-medium">{formattedDate}</span>
      </div>

      {/* Share Button & More Options */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1b2b38] hover:bg-[#203648] text-[#00beff] font-semibold text-xs py-2 px-3.5 rounded border border-[#00beff]/30 transition-all cursor-pointer shadow-sm"
        >
          <span>{copied ? "Link Copied!" : "Share"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        <button
          className="p-2 rounded bg-[#23252a] hover:bg-[#2a2c32] text-white/80 hover:text-white transition-colors cursor-pointer border border-[#31333b]"
          title="More options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Attendees / Participants preview */}
      {participants.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-[#80858e] uppercase tracking-wider">
            Attendees:
          </span>
          {participants.map((p, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-[#24262c] text-white/85 px-2 py-0.5 rounded border border-[#30333c]"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
