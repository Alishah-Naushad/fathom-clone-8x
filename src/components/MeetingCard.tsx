import React from "react";

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

  const formattedDuration = React.useMemo(() => {
    const mins = Math.round(meeting.duration_minutes || 0);
    if (mins <= 0) return "";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
  }, [meeting.duration_minutes]);

  return (
    <div
      onClick={() => onClick?.(meeting)}
      className="group flex flex-col gap-2.5 w-full cursor-pointer select-none p-3 rounded-xl bg-[#111320]/80 hover:bg-[#16192a]/90 border border-indigo-500/15 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:-translate-y-0.5"
    >
      {/* Audio Recording Cover / Visualizer with Hearken Logo */}
      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-gradient-to-br from-[#121424] via-[#171a30] to-[#0c0d18] ring-1 ring-white/10 group-hover:ring-cyan-500/50 transition-all flex flex-col items-center justify-center p-4">
        {/* Ambient glowing backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(6,182,212,0.18),transparent_65%)]" />

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Centered Hearken Emblem & Audio Visualizer */}
        <div className="relative z-10 flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#0e101c]/80 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all">
            <div className="flex items-center gap-[3px] h-6">
              <span className="w-[3px] h-3 bg-cyan-400 rounded-full group-hover:h-5 transition-all duration-300" />
              <span className="w-[3px] h-5 bg-indigo-400 rounded-full group-hover:h-3 transition-all duration-300" />
              <span className="w-[3px] h-4 bg-cyan-300 rounded-full group-hover:h-6 transition-all duration-300" />
              <span className="w-[3px] h-2 bg-purple-400 rounded-full group-hover:h-4 transition-all duration-300" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-black tracking-[0.25em] text-slate-200 uppercase">HEARKEN</span>
          </div>
        </div>

        {/* Audio Recording pill top-left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-cyan-300">
          <div className="flex items-center gap-[2px] h-2.5">
            <span className="w-[2px] h-1.5 bg-cyan-400 rounded-full" />
            <span className="w-[2px] h-2.5 bg-indigo-400 rounded-full" />
            <span className="w-[2px] h-2 bg-cyan-300 rounded-full" />
          </div>
          <span>Audio Recording</span>
        </div>

        {/* Duration Badge bottom-right */}
        {formattedDuration && (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-white/10 shadow">
            {formattedDuration}
          </span>
        )}

        {/* Formatted Date bottom-left */}
        {formattedDate && (
          <span className="absolute bottom-2 left-2 text-[10px] font-medium text-slate-300 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
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
