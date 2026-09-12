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
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
            <Header searchQuery="" onSearchChange={() => { }} />

            <main className="flex-1 px-6 pt-6 pb-12 max-w-3xl w-full mx-auto">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Search titles, attendees, or what was said..."
                    className="max-w-full mb-6"
                />

                {!query.trim() ? (
                    <p className="text-[#80858e] text-sm">
                        Start typing to search across all your meetings.
                    </p>
                ) : loading ? (
                    <p className="text-[#80858e] text-sm">Searching...</p>
                ) : results.length === 0 ? (
                    <p className="text-[#80858e] text-sm">No meetings found for "{query}".</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {results.map(({ meeting, snippet }) => (
                            <Link
                                key={meeting.id}
                                href={`/meetings/${meeting.id}`}
                                className="block p-4 rounded-lg bg-[#202126] border border-[#2b2c34] hover:border-[#00beff]/40 hover:bg-[#25262c] transition-colors"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-white">{meeting.title}</span>
                                    <span className="text-[11px] text-[#80858e]">
                                        {meeting.duration_minutes} min
                                    </span>
                                </div>
                                {meeting.participants?.length > 0 && (
                                    <p className="text-[11px] text-[#80858e] mt-0.5">
                                        {meeting.participants.join(", ")}
                                    </p>
                                )}
                                {snippet && (
                                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                        <span className="text-[#00beff] font-mono text-[10px]">
                                            [{formatTime(snippet.timestamp_seconds)}]
                                        </span>{" "}
                                        <span className="font-semibold">{snippet.speaker}:</span> {snippet.text}
                                    </p>
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
        <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
            <SearchPageInner />
        </Suspense>
    );
}