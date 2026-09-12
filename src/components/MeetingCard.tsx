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

  return (
    <div
      onClick={() => onClick?.(meeting)}
      className="group flex flex-col gap-1.5 w-full cursor-pointer select-none"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-[#212124] ring-1 ring-white/5 group-hover:ring-[#00beff]/40 group-hover:scale-[1.01] transition-all shadow-md">
        <Image
          src={thumbSrc}
          alt={meeting.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
        />

        {/* Duration Badge */}
        {meeting.duration_minutes > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/90 backdrop-blur-xs text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow">
            {meeting.duration_minutes} min
          </span>
        )}
      </div>

      {/* Call Title & Metadata */}
      <div className="flex flex-col pt-1">
        <span className="text-xs font-semibold text-white group-hover:text-[#00beff] transition-colors line-clamp-1">
          {meeting.title}
        </span>
        {meeting.participants && meeting.participants.length > 0 && (
          <span className="text-[11px] text-[#80858e] line-clamp-1 mt-0.5">
            {meeting.participants.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
