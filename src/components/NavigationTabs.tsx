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
    <nav className="w-full bg-[#1a1a1a] px-6 pt-3.5 pb-0 flex items-center gap-6 border-b border-[#26272c]/40">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
  );
}
