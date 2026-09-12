import React from "react";

interface EmptyStateProps {
  message?: string;
  tabName?: string;
}

export default function EmptyState({
  message,
  tabName,
}: EmptyStateProps) {
  const displayMessage = message || (tabName ? `No recordings in ${tabName}` : "No recordings found");

  return (
    <div className="py-20 flex flex-col items-center justify-center text-center text-[#80858e]">
      <p className="text-sm">{displayMessage}</p>
    </div>
  );
}
