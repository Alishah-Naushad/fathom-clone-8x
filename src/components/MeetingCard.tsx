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
  return (
    <div
      onClick={() => onClick?.(meeting)}
      className="group flex flex-col gap-1.5 w-full max-w-[315px] cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-[#212124] ring-1 ring-white/5 group-hover:ring-white/10 transition-all">
        {meeting.thumbnail_url ? (
          <Image
            src={meeting.thumbnail_url}
            alt={meeting.title}
            fill
            sizes="(max-width: 768px) 100vw, 315px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#24252a] text-[#80858e]">
            <svg
              className="w-10 h-10 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Duration Badge */}
        {meeting.duration_minutes > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
            {meeting.duration_minutes} min
          </span>
        )}
      </div>

      {/* Call Title & Metadata */}
      <div className="flex flex-col pt-0.5">
        <span className="text-xs font-semibold text-white group-hover:text-[#00beff] transition-colors line-clamp-1">
          {meeting.title}
        </span>
        {meeting.participants && meeting.participants.length > 0 && (
          <span className="text-[11px] text-[#80858e] line-clamp-1">
            {meeting.participants.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
