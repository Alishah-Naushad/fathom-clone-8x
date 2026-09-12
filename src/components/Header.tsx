"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

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
    <header className="w-full bg-[#212124] px-8 py-3.5 flex items-center gap-8 border-b border-[#28292d]">
      <Logo onClick={onLogoClick} />
      <div onKeyDown={handleKeyDown} className="flex-1 max-w-md">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
    </header>
  );
}