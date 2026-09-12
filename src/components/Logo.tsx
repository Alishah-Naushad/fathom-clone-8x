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
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      <span className="text-2xl font-extrabold tracking-widest text-white group-hover:text-white/95 transition-colors">
        FATHOM
      </span>
      {/* Cyan Wave Logo Mark */}
      <svg
        className="w-6 h-6 text-[#00beff] group-hover:brightness-110 transition-all"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M4 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5zm3.5-5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5zm4.5-5c0-.83.67-1.5 1.5-1.5h4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H13.5c-.83 0-1.5-.67-1.5-1.5z"
          fill="#00beff"
        />
      </svg>
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
