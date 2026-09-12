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

export default function FathomDashboard() {
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
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <NavigationTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-6 pt-5 pb-12">
        {loading ? (
          <p className="text-[#80858e] text-sm">Loading meetings...</p>
        ) : filteredMeetings.length === 0 ? (
          <EmptyState tabName={activeTab} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
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