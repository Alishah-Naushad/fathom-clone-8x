"use client";

import React, { useState, useEffect, useMemo } from "react";

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

export type MeetingTimeStatus = "in_progress" | "starting_soon" | "upcoming" | "ended";

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
  const [now, setNow] = useState<number>(() => Date.now());

  // Periodically update current time every 15 seconds to dynamically adjust meeting status
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const status: MeetingTimeStatus = useMemo(() => {
    if (!meeting.start) return "upcoming";

    const startMs = new Date(meeting.start).getTime();
    if (isNaN(startMs)) return "upcoming";

    const endMs = meeting.end
      ? new Date(meeting.end).getTime()
      : startMs + 60 * 60 * 1000;

    if (now > endMs) {
      return "ended";
    }

    if (now >= startMs && now <= endMs) {
      return "in_progress";
    }

    // Starts within the next 15 minutes
    if (startMs - now <= 15 * 60 * 1000) {
      return "starting_soon";
    }

    return "upcoming";
  }, [meeting.start, meeting.end, now]);

  const formattedDate = useMemo(() => {
    if (!meeting.start) return "Date unavailable";
    try {
      return new Date(meeting.start).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  }, [meeting.start]);

  const formattedTime = useMemo(() => {
    if (!meeting.start) return "";
    try {
      const startStr = new Date(meeting.start).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      if (meeting.end) {
        const endStr = new Date(meeting.end).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        return `${startStr} – ${endStr}`;
      }

      return startStr;
    } catch {
      return "";
    }
  }, [meeting.start, meeting.end]);

  async function handleSendNotetaker() {
    if (!meeting.meetLink || sending || sent || status === "ended") return;

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

  const containerStyling =
    status === "in_progress"
      ? "border-emerald-500/30 hover:border-emerald-400/50 bg-[#111824]/80 hover:bg-[#142030]/90 shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)]"
      : status === "starting_soon"
      ? "border-amber-500/30 hover:border-amber-400/50 bg-[#161424]/80 hover:bg-[#1e1b30]/90 shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)]"
      : status === "ended"
      ? "border-slate-800/80 bg-[#0e101a]/70 opacity-75"
      : "border-indigo-500/15 hover:border-cyan-500/40 bg-[#111320]/80 hover:bg-[#16192a]/90 shadow-lg";

  return (
    <div
      className={`group flex flex-col gap-4 w-full p-5 rounded-xl border transition-all duration-300 ${containerStyling}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {meeting.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
            <span>{formattedDate}</span>
            {formattedTime && (
              <>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-300">{formattedTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Status Badge */}
        {status === "in_progress" && (
          <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            In Progress
          </span>
        )}

        {status === "starting_soon" && (
          <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Starting Soon
          </span>
        )}

        {status === "upcoming" && (
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
            Upcoming
          </span>
        )}

        {status === "ended" && (
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ended
          </span>
        )}
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
          disabled={!meeting.meetLink || sending || sent || status === "ended"}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
            status === "in_progress"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
          }`}
        >
          {sending
            ? "Sending..."
            : sent
            ? "Notetaker Sent"
            : status === "ended"
            ? "Meeting Ended"
            : status === "in_progress"
            ? "Send Notetaker Now"
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