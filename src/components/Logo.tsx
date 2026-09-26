import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function Logo({
  className = "",
  onClick,
  href = "/",
}: LogoProps) {
  const content = (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      {/* Voice Neural Orb / Soundwave Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
        {/* Animated equalizer bars inside logo */}
        <div className="flex items-center gap-[2.5px] h-4">
          <span className="w-[2.5px] h-2.5 bg-cyan-400 rounded-full group-hover:h-3.5 transition-all duration-300" />
          <span className="w-[2.5px] h-4 bg-indigo-400 rounded-full group-hover:h-2.5 transition-all duration-300" />
          <span className="w-[2.5px] h-3 bg-cyan-300 rounded-full group-hover:h-4 transition-all duration-300" />
          <span className="w-[2.5px] h-1.5 bg-purple-400 rounded-full group-hover:h-3 transition-all duration-300" />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-lg font-black tracking-[0.2em] bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent group-hover:to-cyan-200 transition-colors">
          HEARKEN
        </span>
        <span className="text-[9px] font-semibold tracking-wider text-cyan-400/80 uppercase -mt-1">
          AI Meeting Note Taker
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
