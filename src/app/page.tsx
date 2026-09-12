"use client";

import React, { useState } from "react";
import { Header, NavigationTabs, EmptyState, TabItem } from "@/components";

const TABS: TabItem[] = [
  { id: "My Calls", label: "My Calls" },
  { id: "Team Calls", label: "Team Calls" },
  { id: "Playlists", label: "Playlists" },
  { id: "Alerts", label: "Alerts" },
  { id: "Deals", label: "Deals" },
];

export default function FathomDashboard() {
  const [activeTab, setActiveTab] = useState<string>("My Calls");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-5 pb-12">
        <EmptyState tabName={activeTab} />
      </main>
    </div>
  );
}
