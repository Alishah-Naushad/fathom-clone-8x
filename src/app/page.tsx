"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Header,
  NavigationTabs,
  EmptyState,
  MeetingCard,
  UpcomingMeetingCard,
  LiveMeetingCard,
  LandingPage,
  TabItem,
  MeetingItem,
} from "@/components";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const TABS: TabItem[] = [
  { id: "My Meetings", label: "My Meetings" },
  { id: "Upcoming Meetings", label: "Upcoming Meetings" },
  { id: "Live Meeting", label: "Live Meeting" },
];

export default function HearkenHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>("My Meetings");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [liveBots, setLiveBots] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // Check Auth State on mount & listen for real-time changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setActiveTab("My Meetings");
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch My Meetings when user is logged in
  const loadMeetings = useCallback(async () => {
    if (!user) {
      setMeetings([]);
      setMeetingsLoading(false);
      return;
    }

    setMeetingsLoading(true);
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("meeting_date", { ascending: false });

    if (error) console.error("Failed to load meetings:", error);
    else setMeetings(data ?? []);
    setMeetingsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user, loadMeetings]);

  // Upcoming Meetings — fetched only when that tab is active
  useEffect(() => {
    if (activeTab !== "Upcoming Meetings" || !user) return;
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
  }, [activeTab, user]);

  // Live Meeting — poll every 5s while this tab is active
  const fetchLiveBots = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/meeting-bots/live");
      const data = await res.json();
      const bots = data.bots ?? [];
      setLiveBots(bots);
      // Auto-refresh meetings if any bot is active or transcribing
      if (bots.length > 0) {
        loadMeetings();
      }
    } catch (err) {
      console.error("Failed to fetch live bots:", err);
    }
  }, [user, loadMeetings]);

  useEffect(() => {
    if (activeTab !== "Live Meeting" || !user) return;
    setLiveLoading(true);
    fetchLiveBots();
    setLiveLoading(false);

    const interval = setInterval(fetchLiveBots, 5000);
    return () => clearInterval(interval);
  }, [activeTab, fetchLiveBots, user]);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initial Auth Loading Spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-xs text-slate-300">Loading Hearken...</p>
        </div>
      </div>
    );
  }

  // If not signed in: Render Landing Page with Features & Google Sign-In box on the right
  if (!user) {
    return <LandingPage />;
  }

  // If signed in: Render full Dashboard defaulting to My Meetings
  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <NavigationTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-6 lg:px-8 pt-6 pb-16 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {activeTab}
          </span>
          {activeTab === "My Meetings" && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
              {filteredMeetings.length} meeting{filteredMeetings.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {activeTab === "Upcoming Meetings" && (
          calendarLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading your Google Calendar meetings...</p>
            </div>
          ) : calendarError ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
              {calendarError}
            </div>
          ) : calendarEvents.length === 0 ? (
            <EmptyState tabName={activeTab} message="No upcoming Google Calendar meetings found." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {calendarEvents.map((event) => (
                <UpcomingMeetingCard
                  key={event.id}
                  meeting={event}
                  onNotetakerSent={fetchLiveBots}
                />
              ))}
            </div>
          )
        )}

        {activeTab === "Live Meeting" && (
          liveLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Checking for live meetings...</p>
            </div>
          ) : liveBots.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs max-w-md mx-auto">
              <p>No meetings are currently live. Send a notetaker from the <strong>Upcoming Meetings</strong> tab to begin recording.</p>
            </div>
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
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading your recorded meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <EmptyState tabName={activeTab} message="No recorded meetings yet. Send a notetaker to an upcoming call to create your first recording!" />
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
          )
        )}
      </main>
    </div>
  );
}