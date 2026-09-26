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
    <div className="flex flex-col gap-3.5 pb-4 border-b border-indigo-500/15">
      {/* Title & Date */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
        <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
      </div>

      {/* Share Button & More Options */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 text-cyan-300 font-semibold text-xs py-2 px-3.5 rounded-lg border border-cyan-500/30 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <span>{copied ? "Link Copied!" : "Share Meeting"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        <button
          className="p-2 rounded-lg bg-[#181a2b] hover:bg-[#20233a] text-slate-400 hover:text-white transition-colors cursor-pointer border border-indigo-500/20"
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
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Speakers:
          </span>
          {participants.map((p, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-[#161828] text-slate-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
