"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components";
import {
  VideoPlayer,
  MeetingHeader,
  ActionItemsSection,
  AnnotationsSection,
  SummaryTab,
  TranscriptTab,
  AskFathomTab,
  ActionItem,
  HighlightItem,
  SummaryRecord,
  TranscriptLine,
} from "@/components/meeting";
import { supabase } from "@/lib/supabase";

interface MeetingDetailProps {
  params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: MeetingDetailProps) {
  const { id: meetingId } = use(params);

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [summaries, setSummaries] = useState<SummaryRecord[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);

  const [activeSubTab, setActiveSubTab] = useState<"SUMMARY" | "TRANSCRIPT" | "ASK HEARKEN">("SUMMARY");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadMeetingData() {
      if (!meetingId) return;
      setLoading(true);

      try {
        // 1. Fetch meeting record
        const { data: mData, error: mErr } = await supabase
          .from("meetings")
          .select("*")
          .eq("id", meetingId)
          .single();

        if (mErr) console.error("Error fetching meeting:", mErr);
        else setMeeting(mData);

        // 2. Fetch transcript lines
        const { data: tData, error: tErr } = await supabase
          .from("transcript_lines")
          .select("*")
          .eq("meeting_id", meetingId)
          .order("line_order", { ascending: true });

        if (tErr) console.error("Error fetching transcript lines:", tErr);
        else setTranscriptLines(tData ?? []);

        // 3. Fetch summaries
        const { data: sData, error: sErr } = await supabase
          .from("summaries")
          .select("*")
          .eq("meeting_id", meetingId);

        if (sErr) console.error("Error fetching summaries:", sErr);
        else setSummaries(sData ?? []);

        // 4. Fetch action items
        const { data: aData, error: aErr } = await supabase
          .from("action_items")
          .select("*")
          .eq("meeting_id", meetingId);

        if (aErr) console.error("Error fetching action items:", aErr);
        else setActionItems(aData ?? []);

        // 5. Fetch highlights
        const { data: hData, error: hErr } = await supabase
          .from("highlights")
          .select("*")
          .eq("meeting_id", meetingId);

        if (hErr) console.error("Error fetching highlights:", hErr);
        else {
          const mappedHighlights = (hData ?? []).map((h) => {
            const line = (tData ?? []).find((l) => l.id === h.transcript_line_id);
            return {
              ...h,
              line_timestamp_seconds: line?.timestamp_seconds ?? 34,
            };
          });
          setHighlights(mappedHighlights);
        }
      } catch (err) {
        console.error("Failed to load meeting details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMeetingData();
  }, [meetingId]);

  const fullTranscriptText = React.useMemo(() => {
    return transcriptLines.map((l) => `${l.speaker}: ${l.text}`).join("\n");
  }, [transcriptLines]);

  const defaultSummaryText = React.useMemo(() => {
    return summaries.length > 0 ? summaries[0].content : "";
  }, [summaries]);

  const highlightLineIds = React.useMemo(() => {
    return highlights.map((h) => h.transcript_line_id);
  }, [highlights]);

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex-1 flex items-center justify-center py-32 text-center text-slate-400 text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading meeting recording & summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="text-slate-400 text-sm">Meeting not found.</p>
          <Link
            href="/"
            className="text-xs text-slate-950 font-bold bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
            ← Back to All Recordings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Container - 2 Column Split */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left Column: Video Player + Sub-Tabs */}
        <div className="flex flex-col gap-6 w-full">
          {/* Video Player */}
          <VideoPlayer
            thumbnailUrl={meeting.thumbnail_url || "/test-call-thumb.png"}
            durationMinutes={meeting.duration_minutes || 1}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            title={meeting.title}
          />

          {/* Sub-Tabs: SUMMARY | TRANSCRIPT | ASK HEARKEN */}
          <div className="flex items-center gap-4 border-b border-indigo-500/15 pt-1">
            {(["SUMMARY", "TRANSCRIPT", "ASK HEARKEN"] as const).map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`text-xs font-bold pb-3 px-1 transition-all relative cursor-pointer tracking-wider flex items-center gap-1.5 ${
                    isActive
                      ? "text-cyan-300 font-extrabold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab === "ASK HEARKEN" && <span className="text-cyan-400">✦</span>}
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="w-full">
            {activeSubTab === "SUMMARY" && (
              <SummaryTab
                meetingId={meeting.id}
                defaultTemplate={meeting.meeting_type || "enhanced"}
                summaries={summaries}
                transcriptText={fullTranscriptText}
                onSummaryGenerated={(newSummary) => {
                  setSummaries((prev) => [...prev, newSummary]);
                }}
              />
            )}

            {activeSubTab === "TRANSCRIPT" && (
              <TranscriptTab
                meetingId={meeting.id}
                lines={transcriptLines}
                highlightLineIds={highlightLineIds}
                currentTime={currentTime}
                onJumpToTime={setCurrentTime}
                onHighlightCreated={(lineId, note) => {
                  const line = transcriptLines.find((l) => l.id === lineId);
                  setHighlights((prev) => [
                    ...prev,
                    {
                      id: "temp-" + Date.now(),
                      meeting_id: meeting.id,
                      transcript_line_id: lineId,
                      note,
                      line_timestamp_seconds: line?.timestamp_seconds ?? 0,
                    },
                  ]);
                }}
              />
            )}

            {activeSubTab === "ASK HEARKEN" && (
              <AskFathomTab
                transcriptText={fullTranscriptText}
                summaryText={defaultSummaryText}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Meeting Info, Action Items, Annotations */}
        <aside className="w-full flex flex-col gap-5 bg-[#10121e]/90 p-5 rounded-2xl border border-indigo-500/20 shadow-2xl backdrop-blur-xl sticky top-20">
          <MeetingHeader
            title={meeting.title}
            meetingDate={meeting.meeting_date}
            participants={meeting.participants}
          />

          <ActionItemsSection
            meetingId={meeting.id}
            actionItems={actionItems}
            onActionItemsUpdate={setActionItems}
          />

          <AnnotationsSection
            highlights={highlights}
            onJumpToTime={setCurrentTime}
          />
        </aside>
      </main>
    </div>
  );
}
