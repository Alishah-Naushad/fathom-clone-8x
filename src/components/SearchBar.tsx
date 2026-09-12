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
  placeholder = "Search Call Recordings",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 max-w-sm ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#80858e]">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#2d2c31] text-xs text-white placeholder-[#80858e] pl-8 pr-3 py-1.5 rounded border border-transparent focus:outline-none focus:border-[#00beff]/50 transition-colors"
      />
    </div>
  );
}
