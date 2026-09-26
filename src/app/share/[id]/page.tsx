"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ShareMeetingProps {
  params: Promise<{ id: string }>;
}

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  participants: string[];
  meeting_type: string;
}

interface TranscriptLine {
  id: string;
  speaker: string;
  timestamp_seconds: number;
  text: string;
  line_order: number;
}

interface Summary {
  template: string;
  content: string;
}

export default function SharePage({ params }: ShareMeetingProps) {
  const { id: meetingId } = use(params);

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: mData } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();

      const { data: tData } = await supabase
        .from("transcript_lines")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("line_order", { ascending: true });
      const lines = tData ?? [];
      setTranscriptLines(lines);

      if (mData) {
        if (lines.length > 0) {
          const maxSec = Math.max(...lines.map((l) => Number(l.timestamp_seconds) || 0));
          if (maxSec > 0) {
            const calculatedMin = Math.max(1, Math.round(maxSec / 60));
            if (!mData.duration_minutes || mData.duration_minutes <= 2 || calculatedMin > mData.duration_minutes) {
              mData.duration_minutes = calculatedMin;
            }
          }
        }
        setMeeting(mData);
      }

      if (mData) {
        const { data: sData } = await supabase
          .from("summaries")
          .select("template, content")
          .eq("meeting_id", meetingId)
          .eq("template", mData.meeting_type)
          .single();
        setSummary(sData);
      }

      setLoading(false);
    }
    loadData();
  }, [meetingId]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const formattedDate = meeting
    ? new Date(meeting.meeting_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading shared meeting recording...</span>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#090a10] flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-slate-400 text-sm">This shared meeting could not be found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline">
          Go to Hearken Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Simple shared-view header */}
      <header className="w-full bg-[#0d0f18]/80 backdrop-blur-xl px-6 lg:px-8 py-3.5 border-b border-indigo-500/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 h-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="w-1.5 h-3 bg-indigo-400 rounded-full" />
            <span className="w-1.5 h-2 bg-purple-400 rounded-full" />
          </div>
          <span className="text-white font-black tracking-[0.2em] text-sm">HEARKEN</span>
        </div>
        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Shared Meeting Recording
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Meeting Title & Meta */}
        <div className="flex flex-col gap-2 pb-5 border-b border-indigo-500/15">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{meeting.title}</h1>
          <span className="text-xs text-slate-400">
            {formattedDate} · {meeting.duration_minutes} min recording
          </span>
          {meeting.participants?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Speakers:
              </span>
              {meeting.participants.map((p, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-[#141624] text-slate-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">✦</span>
            <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase">Neural Summary</h2>
          </div>
          {summary?.content ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 space-y-3 p-5 rounded-2xl bg-[#111322]/80 border border-indigo-500/20">
              {summary.content.split("\n\n").map((block, idx) => (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                  {block}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No summary available.</p>
          )}
        </section>

        {/* Read-only Transcript */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">⚡</span>
            <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase">Meeting Transcript</h2>
          </div>
          <div className="flex flex-col gap-3">
            {transcriptLines.map((line) => (
              <div key={line.id} className="flex flex-col gap-1 p-3 rounded-xl bg-[#111322]/50 border border-indigo-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 font-medium">
                    [{formatTime(line.timestamp_seconds)}]
                  </span>
                  <span className="text-xs font-bold text-slate-200">{line.speaker}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">{line.text}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-slate-500 text-center pt-6 border-t border-indigo-500/15">
          Synthesized by Hearken — AI Meeting Note Taker.
        </p>
      </main>
    </div>
  );
}