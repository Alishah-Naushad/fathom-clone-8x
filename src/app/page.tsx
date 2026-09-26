"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header, NavigationTabs, EmptyState, MeetingCard, UpcomingMeetingCard, LiveMeetingCard, TabItem, MeetingItem } from "@/components";
import { supabase } from "@/lib/supabase";

const TABS: TabItem[] = [
  { id: "Upcoming Meetings", label: "Upcoming Meetings" },
  { id: "Live Meeting", label: "Live Meeting" },
  { id: "My Meetings", label: "My Meetings" },
];

export default function HearkenDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("My Meetings");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [liveBots, setLiveBots] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // My Meetings — scoped to signed-in user
  useEffect(() => {
    async function loadMeetings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMeetings([]);
        setMeetingsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
        .order("meeting_date", { ascending: false });

      if (error) console.error("Failed to load meetings:", error);
      else setMeetings(data ?? []);
      setMeetingsLoading(false);
    }
    loadMeetings();
  }, []);

  // Upcoming Meetings — fetched only when that tab is active
  useEffect(() => {
    if (activeTab !== "Upcoming Meetings") return;
    setCalendarLoading(true);
    setCalendarError(null);

    fetch("/api/calendar") 
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setCalendarError(data.error);
        else setCalendarEvents(data.events ?? []);
      })
      .catch((err) => setCalendarError(err.message))
      .finally(() => setCalendarLoading(false));
  }, [activeTab]);

  // Live Meeting — poll every 5s while this tab is active
  const fetchLiveBots = useCallback(() => {
    fetch("/api/meeting-bots/live")
      .then((res) => res.json())
      .then((data) => setLiveBots(data.bots ?? []))
      .catch((err) => console.error("Failed to fetch live bots:", err));
  }, []);

  useEffect(() => {
    if (activeTab !== "Live Meeting") return;
    setLiveLoading(true);
    fetchLiveBots();
    setLiveLoading(false);

    const interval = setInterval(fetchLiveBots, 5000);
    return () => clearInterval(interval);
  }, [activeTab, fetchLiveBots]);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <NavigationTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-6 lg:px-8 pt-6 pb-16 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {activeTab}
          </span>
        </div>

        {activeTab === "Upcoming Meetings" && (
          calendarLoading ? (
            <p className="text-slate-400 text-sm">Loading your calendar…</p>
          ) : calendarError ? (
            <p className="text-red-400 text-sm">{calendarError}</p>
          ) : calendarEvents.length === 0 ? (
            <EmptyState tabName={activeTab} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {calendarEvents.map((event) => (
                <UpcomingMeetingCard key={event.id} meeting={event} />
              ))}
            </div>
          )
        )}

        {activeTab === "Live Meeting" && (
          liveLoading ? (
            <p className="text-slate-400 text-sm">Checking for live meetings…</p>
          ) : liveBots.length === 0 ? (
            <p className="text-slate-400 text-sm">No meetings are currently live. Send a notetaker from Upcoming Meetings to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {liveBots.map((bot) => (
                <LiveMeetingCard key={bot.bot_id} bot={bot} onNoteAdded={fetchLiveBots} />
              ))}
            </div>
          )
        )}

        {activeTab === "My Meetings" && (
          meetingsLoading ? (
            <p className="text-slate-400 text-sm">Loading meetings…</p>
          ) : filteredMeetings.length === 0 ? (
            <EmptyState tabName={activeTab} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} onClick={(m) => router.push(`/meetings/${m.id}`)} />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}