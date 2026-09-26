import React from "react";

interface EmptyStateProps {
  message?: string;
  tabName?: string;
}

export default function EmptyState({
  message,
  tabName,
}: EmptyStateProps) {
  const displayMessage = message || (tabName ? `No meetings in ${tabName}` : "No meetings found");

  return (
    <div className="py-24 flex flex-col items-center justify-center text-center px-4">
      {/* Meeting Assistant Illustration */}
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/15 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-1 h-6">
          <span className="w-1 h-3 bg-cyan-400/60 rounded-full" />
          <span className="w-1 h-6 bg-indigo-400/60 rounded-full" />
          <span className="w-1 h-4 bg-purple-400/60 rounded-full" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-slate-200">Hearken Meeting Assistant</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{displayMessage}</p>
    </div>
  );
}
