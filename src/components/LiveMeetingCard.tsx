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
  joining_call: "Joining call…",
  in_waiting_room: "Waiting to be admitted…",
  in_call_not_recording: "In call (not recording yet)",
  in_call_recording: "Recording",
};

export default function LiveMeetingCard({ bot, onNoteAdded }: { bot: LiveBot; onNoteAdded: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!bot.recording_started_at) return;
    const start = new Date(bot.recording_started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [bot.recording_started_at]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAddNote = async () => {
    if (!noteText.trim() || sending) return;
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
    <div className="p-5 rounded-xl bg-[#111320]/80 border border-cyan-500/30 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">{bot.title || "Live meeting"}</h3>
        <span className="flex items-center gap-1.5 text-xs text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {STATUS_LABELS[bot.status] ?? bot.status}
        </span>
      </div>

      {bot.recording_started_at && (
        <div className="text-2xl font-mono text-cyan-300">{formatTime(elapsed)}</div>
      )}

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
          className="px-4 py-2 rounded-md text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {bot.live_notes?.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {bot.live_notes.map((n, i) => (
            <div key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-cyan-400 font-mono">[{formatTime(n.elapsed_seconds)}]</span>
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}