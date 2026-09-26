"use client";

import React, { useState } from "react";

export interface CalendarMeeting {
  id: string;
  title: string;
  description: string;
  start: string | null;
  end: string | null;
  meetLink: string | null;
  calendarLink: string | null;
  attendees: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

interface UpcomingMeetingCardProps {
  meeting: CalendarMeeting;
  onNotetakerSent?: () => void;
}

export default function UpcomingMeetingCard({
  meeting,
  onNotetakerSent,
}: UpcomingMeetingCardProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = meeting.start
    ? new Date(meeting.start).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Date unavailable";

  const formattedTime = meeting.start
    ? new Date(meeting.start).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  async function handleSendNotetaker() {
    if (!meeting.meetLink || sending || sent) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/meeting-baas/bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingUrl: meeting.meetLink,
          title: meeting.title,
          calendarEventId: meeting.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send notetaker");
      }

      setSent(true);
      onNotetakerSent?.();
    } catch (err) {
      console.error("Failed to send notetaker:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send notetaker"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="group flex flex-col gap-4 w-full p-5 rounded-xl bg-[#111320]/80 hover:bg-[#16192a]/90 border border-indigo-500/15 hover:border-cyan-500/40 transition-all duration-300 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {meeting.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
            <span>{formattedDate}</span>
            <span className="text-slate-600">•</span>
            <span>{formattedTime}</span>
          </div>
        </div>

        <span className="shrink-0 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
          Upcoming
        </span>
      </div>

      {meeting.description && (
        <p className="text-xs text-slate-400 line-clamp-2">
          {meeting.description}
        </p>
      )}

      {meeting.attendees.length > 0 && (
        <div className="text-xs text-slate-400">
          {meeting.attendees.length} attendee
          {meeting.attendees.length !== 1 ? "s" : ""}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSendNotetaker}
          disabled={!meeting.meetLink || sending || sent}
          className="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending
            ? "Sending..."
            : sent
              ? "Notetaker Sent"
              : "Send Notetaker"}
        </button>

        {meeting.calendarLink && (
          <a
            href={meeting.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] transition-all"
          >
            Calendar
          </a>
        )}
      </div>
    </div>
  );
}