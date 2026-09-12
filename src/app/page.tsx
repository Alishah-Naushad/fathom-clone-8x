"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function FathomDashboard() {
  const [activeTab, setActiveTab] = useState("My Calls");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "My Calls", label: "My Calls" },
    { id: "Team Calls", label: "Team Calls" },
    { id: "Playlists", label: "Playlists" },
    { id: "Alerts", label: "Alerts" },
    { id: "Deals", label: "Deals" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="w-full bg-[#212124] px-6 py-2.5 flex items-center gap-6 border-b border-[#28292d]">
        {/* Fathom Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xl font-bold tracking-wider text-white">FATHOM</span>
          {/* Cyan Wave Logo Mark */}
          <svg
            className="w-5 h-5 text-[#00beff]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M4 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5zm3.5-5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5zm4.5-5c0-.83.67-1.5 1.5-1.5h4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H13.5c-.83 0-1.5-.67-1.5-1.5z"
              fill="#00beff"
            />
          </svg>
        </div>

        {/* Search Bar Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#80858e]">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Call Recordings"
            className="w-full bg-[#2d2c31] text-xs text-white placeholder-[#80858e] pl-8 pr-3 py-1.5 rounded border border-transparent focus:outline-none focus:border-[#00beff]/50 transition-colors"
          />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="w-full bg-[#1a1a1a] px-6 pt-3.5 pb-0 flex items-center gap-6 border-b border-[#26272c]/40">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium pb-2 transition-colors relative cursor-pointer ${
                isActive
                  ? "text-[#00beff]"
                  : "text-white/95 hover:text-white"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00beff]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Dashboard Main Content Area */}
      <main className="flex-1 px-6 pt-5 pb-12">
        {activeTab === "My Calls" && (
          <section className="flex flex-col gap-3">
            {/* Section Header */}
            <h2 className="text-sm font-bold text-white tracking-normal">Today</h2>

            {/* Call Recordings Grid */}
            <div className="flex flex-wrap gap-6">
              <div className="group flex flex-col gap-1.5 w-full max-w-[315px] cursor-pointer">
                {/* Real Video Thumbnail Container */}
                <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-[#212124]">
                  <Image
                    src="/test-call-thumb.png"
                    alt="Test call recording"
                    fill
                    sizes="(max-width: 768px) 100vw, 315px"
                    className="object-cover"
                    priority
                  />
                  {/* Duration Badge */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                    1 min
                  </span>
                </div>

                {/* Call Title */}
                <div className="flex flex-col pt-0.5">
                  <span className="text-xs font-semibold text-white">
                    Test call
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab !== "My Calls" && (
          <div className="py-20 flex flex-col items-center justify-center text-center text-[#80858e]">
            <p className="text-sm">No recordings in {activeTab}</p>
          </div>
        )}
      </main>
    </div>
  );
}
