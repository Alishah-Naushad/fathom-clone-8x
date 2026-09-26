"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import GoogleSignInButton from "./GoogleSignInButton";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onLogoClick?: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onLogoClick,
}: HeaderProps) {
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-[#0d0f18]/80 backdrop-blur-xl px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6 border-b border-indigo-500/10 sticky top-0 z-40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-8 flex-1">
        <Logo onClick={onLogoClick} />
        <div onKeyDown={handleKeyDown} className="flex-1 max-w-md hidden sm:block">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
      </div>

      {/* Top-Right Auth: Sign In / User Profile & Sign Out */}
      <div className="flex items-center gap-3">
        <GoogleSignInButton />
      </div>
    </header>
  );
}