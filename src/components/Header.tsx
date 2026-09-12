import React from "react";
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
  return (
    <header className="w-full bg-[#212124] px-8 py-3.5 flex items-center gap-8 border-b border-[#28292d]">
      <Logo onClick={onLogoClick} />
      <SearchBar value={searchQuery} onChange={onSearchChange} />
    </header>
  );
}
