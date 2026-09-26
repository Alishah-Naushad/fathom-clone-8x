import React from "react";
import Image from "next/image";

export interface MeetingItem {
  id: string;
  title: string;
  duration_minutes: number;
  thumbnail_url?: string;
  meeting_date?: string;
  participant_count?: number;
  participants?: string[];
  meeting_type?: string;
}

interface MeetingCardProps {
  meeting: MeetingItem;
  onClick?: (meeting: MeetingItem) => void;
}

export default function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const thumbSrc = meeting.thumbnail_url || "/test-call-thumb.png";

  const formattedDate = React.useMemo(() => {
    if (!meeting.meeting_date) return "";
    try {
      return new Date(meeting.meeting_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, [meeting.meeting_date]);

  return (
    <div
      onClick={() => onClick?.(meeting)}
      className="group flex flex-col gap-2.5 w-full cursor-pointer select-none p-3 rounded-xl bg-[#111320]/80 hover:bg-[#16192a]/90 border border-indigo-500/15 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:-translate-y-0.5"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#0d0e17] ring-1 ring-white/10 group-hover:ring-cyan-500/50 transition-all">
        <Image
          src={thumbSrc}
          alt={meeting.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />

        {/* Ambient Gradient Overlay on Thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Meeting Visualizer pill top-left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-cyan-300">
          <div className="flex items-center gap-[2px] h-3">
            <span className="w-[2px] h-1.5 bg-cyan-400 rounded-full" />
            <span className="w-[2px] h-3 bg-indigo-400 rounded-full" />
            <span className="w-[2px] h-2 bg-cyan-300 rounded-full" />
          </div>
          <span>AI Recorded</span>
        </div>

        {/* Duration Badge bottom-right */}
        {meeting.duration_minutes > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-white/10 shadow">
            {meeting.duration_minutes}m
          </span>
        )}

        {/* Formatted Date bottom-left */}
        {formattedDate && (
          <span className="absolute bottom-2 left-2 text-[10px] font-medium text-slate-300">
            {formattedDate}
          </span>
        )}
      </div>

      {/* Call Title & Metadata */}
      <div className="flex flex-col px-0.5">
        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
          {meeting.title}
        </h4>
        {meeting.participants && meeting.participants.length > 0 && (
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{meeting.participants.join(", ")}</span>
          </p>
        )}
      </div>
    </div>
  );
}
