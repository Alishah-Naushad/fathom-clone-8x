"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, NavigationTabs, EmptyState, MeetingCard, TabItem, MeetingItem } from "@/components";
import { supabase } from "@/lib/supabase";

const TABS: TabItem[] = [
  { id: "My Calls", label: "My Calls" },
  { id: "Team Calls", label: "Team Calls" },
  { id: "Playlists", label: "Playlists" },
  { id: "Alerts", label: "Alerts" },
  { id: "Deals", label: "Deals" },
];

export default function HearkenDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("My Calls");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeetings() {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false });

      if (error) console.error("Failed to load meetings:", error);
      else setMeetings(data ?? []);
      setLoading(false);
    }
    loadMeetings();
  }, []);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <NavigationTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-6 lg:px-8 pt-6 pb-16 max-w-7xl w-full mx-auto">
        {/* AI Meeting status bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {activeTab}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
              {filteredMeetings.length} calls
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>AI Meeting Notes & Auto-Transcription</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Synthesizing meeting library...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <EmptyState tabName={activeTab} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={(m) => router.push(`/meetings/${m.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}