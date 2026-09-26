"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header, SearchBar } from "@/components";
import { supabase } from "@/lib/supabase";

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  participants: string[];
  thumbnail_url?: string;
}

interface TranscriptMatch {
  meeting_id: string;
  speaker: string;
  text: string;
  timestamp_seconds: number;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [transcriptMatches, setTranscriptMatches] = useState<TranscriptMatch[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all meetings once
  useEffect(() => {
    async function loadMeetings() {
      const { data } = await supabase.from("meetings").select("*");
      setMeetings(data ?? []);
    }
    loadMeetings();
  }, []);

  // Search transcript content whenever query changes (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setTranscriptMatches([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("transcript_lines")
        .select("meeting_id, speaker, text, timestamp_seconds")
        .ilike("text", `%${query.trim()}%`)
        .limit(30);

      if (error) console.error("Transcript search failed:", error);
      setTranscriptMatches(data ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();

    const titleOrParticipantMatches = meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.participants?.some((p) => p.toLowerCase().includes(q))
    );

    const transcriptMeetingIds = new Set(transcriptMatches.map((t) => t.meeting_id));
    const transcriptMeetings = meetings.filter((m) => transcriptMeetingIds.has(m.id));

    const merged = [...titleOrParticipantMatches, ...transcriptMeetings];
    const seen = new Set<string>();
    const deduped = merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    return deduped.map((m) => ({
      meeting: m,
      snippet: transcriptMatches.find((t) => t.meeting_id === m.id),
    }));
  }, [query, meetings, transcriptMatches]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header searchQuery="" onSearchChange={() => { }} />

      <main className="flex-1 px-6 pt-8 pb-16 max-w-3xl w-full mx-auto">
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search meetings, transcripts, speakers, or topics..."
            className="max-w-full"
          />
        </div>

        {!query.trim() ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">Type any topic, name, or spoken phrase to search across all meetings.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Searching meeting records...</span>
          </div>
        ) : results.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-16">No meetings found matching "{query}".</p>
        ) : (
          <div className="flex flex-col gap-3.5">
            <p className="text-xs font-semibold text-slate-400 mb-1">
              Found {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            {results.map(({ meeting, snippet }) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block p-4 rounded-xl bg-[#111322]/80 border border-indigo-500/20 hover:border-cyan-400/50 hover:bg-[#16182c] transition-all shadow-lg hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {meeting.title}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                    {meeting.duration_minutes}m
                  </span>
                </div>
                {meeting.participants?.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {meeting.participants.join(", ")}
                  </p>
                )}
                {snippet && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#0c0d17] border border-indigo-500/10 text-xs text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-mono text-[11px] font-semibold">
                      [{formatTime(snippet.timestamp_seconds)}]
                    </span>{" "}
                    <span className="font-bold text-slate-200">{snippet.speaker}:</span>{" "}
                    <span>{snippet.text}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090a10]" />}>
      <SearchPageInner />
    </Suspense>
  );
}