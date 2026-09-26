import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search meetings, notes, transcripts...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 max-w-md group ${className}`}>
      {/* Voice Sparkle / AI Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#131522]/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-12 py-2 rounded-lg border border-indigo-500/20 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
      />

      {/* Quick shortcut tag */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
          ↵
        </span>
      </div>
    </div>
  );
}
