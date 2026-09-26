"use client";

import { useState, useEffect } from "react";

interface LiveBot {
  id: string;
  bot_id: string;
  title: string | null;
  status: string;
  recording_started_at: string | null;
  live_notes: { text: string; elapsed_seconds: number; created_at: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  sent: "Notetaker dispatched…",
  joining_call: "Joining call…",
  in_waiting_room: "Waiting to be admitted…",
  in_call_not_recording: "In call (not recording yet)",
  in_call_recording: "Recording live call",
  call_ended: "Call ended — Transcribing…",
  left_call: "Left call — Transcribing…",
  transcribing: "Transcribing audio…",
  transcription_in_progress: "Transcribing audio…",
  processing: "Processing meeting…",
};

const TRANSCRIBING_STATUSES = new Set([
  "call_ended",
  "left_call",
  "transcribing",
  "transcription_in_progress",
  "processing",
]);

export default function LiveMeetingCard({
  bot,
  onNoteAdded,
}: {
  bot: LiveBot;
  onNoteAdded: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);

  const isTranscribing = TRANSCRIBING_STATUSES.has(bot.status);

  useEffect(() => {
    if (!bot.recording_started_at) return;
    const start = new Date(bot.recording_started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [bot.recording_started_at]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAddNote = async () => {
    if (!noteText.trim() || sending || isTranscribing) return;
    setSending(true);
    try {
      await fetch(`/api/meeting-bots/${bot.bot_id}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      setNoteText("");
      onNoteAdded();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`p-5 rounded-xl transition-all duration-300 shadow-lg flex flex-col gap-4 border ${
        isTranscribing
          ? "bg-[#141324]/90 border-amber-500/30 shadow-[0_0_25px_-5px_rgba(245,158,11,0.12)]"
          : "bg-[#111320]/80 border-cyan-500/30 hover:border-cyan-400/50"
      }`}
    >
      {/* Card Header: Title and Status Badge */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-100">
          {bot.title || "Live meeting"}
        </h3>

        {isTranscribing ? (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <span className="w-2 h-2 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            {STATUS_LABELS[bot.status] ?? "Transcribing…"}
          </span>
        ) : (
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {STATUS_LABELS[bot.status] ?? bot.status}
          </span>
        )}
      </div>

      {/* Recording Elapsed Timer (while call is active) */}
      {!isTranscribing && bot.recording_started_at && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-bold text-cyan-300">
            {formatTime(elapsed)}
          </span>
          <span className="text-xs text-slate-400">recording duration</span>
        </div>
      )}

      {/* Transcribing Progress Stage */}
      {isTranscribing ? (
        <div className="p-3.5 rounded-lg bg-[#0e101c] border border-amber-500/20 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-amber-400 rounded-full voice-wave-bar" />
              <span className="w-1 bg-cyan-400 rounded-full voice-wave-bar" />
              <span className="w-1 bg-indigo-400 rounded-full voice-wave-bar" />
            </div>
            <span className="text-xs font-semibold text-amber-200">
              AI Transcription & Diarization in Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-300/85 leading-relaxed">
            The meeting has ended. Hearken is processing the audio recording and generating the transcript. Once finished, this card will automatically clear and the recording will appear in <strong>My Meetings</strong>.
          </p>
        </div>
      ) : (
        /* Live Note Taking Form (while call is ongoing) */
        <div className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a highlight or note for this moment…"
            className="flex-1 bg-[#1a1c2e] text-xs text-white px-3 py-2 rounded-md border border-indigo-500/20 focus:outline-none focus:border-cyan-400/50"
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          />
          <button
            onClick={handleAddNote}
            disabled={sending || !noteText.trim()}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Captured Live Notes */}
      {bot.live_notes && bot.live_notes.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Call Highlights ({bot.live_notes.length})
          </span>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {bot.live_notes.map((n, i) => (
              <div
                key={i}
                className="text-xs text-slate-300 flex items-start gap-2 bg-[#0c0d16] p-2 rounded-md border border-white/5"
              >
                <span className="text-cyan-400 font-mono text-[11px] shrink-0">
                  [{formatTime(n.elapsed_seconds)}]
                </span>
                <span className="leading-tight">{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}