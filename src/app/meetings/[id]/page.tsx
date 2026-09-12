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

  const [activeSubTab, setActiveSubTab] = useState<"SUMMARY" | "TRANSCRIPT" | "ASK FATHOM">("SUMMARY");
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
          // Attach timestamp from matching transcript line if present
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
      <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex-1 flex items-center justify-center py-32 text-center text-[#80858e] text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#00beff] border-t-transparent rounded-full animate-spin" />
            <p>Loading meeting recording & summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="text-[#80858e] text-sm">Meeting not found.</p>
          <Link
            href="/"
            className="text-xs text-[#00beff] bg-[#183446] px-4 py-2 rounded font-semibold hover:bg-[#204358] transition-colors"
          >
            ← Back to All Recordings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Container - Responsive 2 Column Split matching screenshots */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left / Main Column: Video Player + Sub-Tabs */}
        <div className="flex flex-col gap-5 w-full">
          {/* Top Video Player Container */}
          <VideoPlayer
            thumbnailUrl={meeting.thumbnail_url || "/test-call-thumb.png"}
            durationMinutes={meeting.duration_minutes || 1}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            title={meeting.title}
          />

          {/* Sub-Tabs: SUMMARY | TRANSCRIPT | ASK FATHOM */}
          <div className="flex items-center gap-8 border-b border-[#2a2c32] pt-1">
            {(["SUMMARY", "TRANSCRIPT", "ASK FATHOM"] as const).map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`text-xs font-bold pb-2.5 transition-colors relative cursor-pointer tracking-wider ${
                    isActive
                      ? "text-[#00beff]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00beff]" />
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

            {activeSubTab === "ASK FATHOM" && (
              <AskFathomTab
                transcriptText={fullTranscriptText}
                summaryText={defaultSummaryText}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Meeting Info, Action Items, Annotations */}
        <aside className="w-full flex flex-col gap-5 bg-[#17181c] p-5 rounded-lg border border-[#26282e] shadow-lg sticky top-6">
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
