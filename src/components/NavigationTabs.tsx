import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface NavigationTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function NavigationTabs({
  tabs,
  activeTab,
  onTabChange,
}: NavigationTabsProps) {
  return (
    <nav className="w-full px-6 lg:px-8 pt-4 pb-0 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-indigo-500/10 bg-transparent">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`text-sm font-medium px-4 py-2.5 rounded-t-lg transition-all relative cursor-pointer tracking-wide flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? "text-cyan-300 font-semibold bg-cyan-950/20 border-b-2 border-cyan-400 shadow-[0_4px_12px_-2px_rgba(6,182,212,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
