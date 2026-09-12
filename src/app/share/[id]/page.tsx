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
      setMeeting(mData);

      const { data: tData } = await supabase
        .from("transcript_lines")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("line_order", { ascending: true });
      setTranscriptLines(tData ?? []);

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
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#80858e] text-sm">
        Loading shared meeting...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-[#80858e] text-sm">This shared meeting could not be found.</p>
        <Link href="/" className="text-xs text-[#00beff] hover:underline">
          Go to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* Simple shared-view header, no search, no nav — this is a public read-only page */}
      <header className="w-full bg-[#212124] px-8 py-3.5 border-b border-[#28292d] flex items-center gap-3">
        <span className="text-white font-extrabold tracking-tight text-lg">FATHOM</span>
        <span className="text-[10px] font-bold text-[#00beff] bg-[#1b2b38] border border-[#00beff]/30 px-2 py-0.5 rounded uppercase tracking-wider">
          Shared Recording
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Meeting Title & Meta */}
        <div className="flex flex-col gap-1 pb-4 border-b border-[#2a2c32]">
          <h1 className="text-xl font-bold text-white tracking-tight">{meeting.title}</h1>
          <span className="text-xs text-[#80858e]">
            {formattedDate} · {meeting.duration_minutes} min
          </span>
          {meeting.participants?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-[11px] font-semibold text-[#80858e] uppercase tracking-wider">
                Attendees:
              </span>
              {meeting.participants.map((p, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-[#24262c] text-white/85 px-2 py-0.5 rounded border border-[#30333c]"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold tracking-wider text-[#80858e] uppercase">Summary</h2>
          {summary?.content ? (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/90 space-y-3">
              {summary.content.split("\n\n").map((block, idx) => (
                <p key={idx} className="text-xs text-white/85 leading-relaxed">
                  {block}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#80858e] italic">No summary available.</p>
          )}
        </section>

        {/* Read-only Transcript */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-wider text-[#80858e] uppercase">Transcript</h2>
          <div className="flex flex-col gap-3">
            {transcriptLines.map((line) => (
              <div key={line.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#80858e]">
                    [{formatTime(line.timestamp_seconds)}]
                  </span>
                  <span className="text-xs font-bold text-white/90">{line.speaker}</span>
                </div>
                <p className="text-xs text-white/85 leading-relaxed pl-1">{line.text}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-[#80858e] text-center pt-4 border-t border-[#2a2c32]">
          Shared via Fathom Clone — a rebuild project.
        </p>
      </main>
    </div>
  );
}