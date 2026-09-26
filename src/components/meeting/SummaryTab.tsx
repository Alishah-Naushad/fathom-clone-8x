"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SummaryRecord {
  id?: string;
  meeting_id: string;
  template: string;
  content: string;
}

interface SummaryTabProps {
  meetingId: string;
  defaultTemplate: string;
  summaries: SummaryRecord[];
  transcriptText?: string;
  onSummaryGenerated?: (summary: SummaryRecord) => void;
}

const TEMPLATE_OPTIONS = [
  { id: "enhanced", name: "Executive Summary", badge: "AI CORE", desc: "Comprehensive meeting takeaways & decisions.", icon: "sparkles" },
  { id: "sales", name: "Sales Meeting", desc: "Prospect needs, buying signals, and next steps.", icon: "chart" },
  { id: "standup", name: "Engineering Standup", desc: "Completed items, active tasks, and blockers.", icon: "users" },
  { id: "one_on_one", name: "1:1 Meeting", desc: "Priorities, feedback alignment, and next steps.", icon: "smile" },
];

export default function SummaryTab({
  meetingId,
  defaultTemplate = "enhanced",
  summaries = [],
  transcriptText = "",
  onSummaryGenerated,
}: SummaryTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentSummary = summaries.find(
    (s) => s.template.toLowerCase() === selectedTemplate.toLowerCase()
  ) || summaries[0];

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setDropdownOpen(false);

    const existing = summaries.find(
      (s) => s.template.toLowerCase() === templateId.toLowerCase()
    );

    if (!existing && transcriptText) {
      setIsGenerating(true);
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: transcriptText,
            template: templateId,
          }),
        });
        const data = await res.json();
        if (data?.summary) {
          const { data: inserted } = await supabase
            .from("summaries")
            .upsert({
              meeting_id: meetingId,
              template: templateId,
              content: data.summary,
            })
            .select()
            .single();

          if (inserted) {
            onSummaryGenerated?.(inserted);
          } else {
            onSummaryGenerated?.({
              meeting_id: meetingId,
              template: templateId,
              content: data.summary,
            });
          }
        }
      } catch (err) {
        console.error("Failed to generate summary on demand:", err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCopy = () => {
    if (currentSummary?.content) {
      navigator.clipboard.writeText(currentSummary.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeOption = TEMPLATE_OPTIONS.find(
    (o) => o.id === selectedTemplate
  ) || { name: selectedTemplate, desc: "" };

  return (
    <div className="flex flex-col gap-4 py-3">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-[#141624] hover:bg-[#1a1e30] text-xs font-semibold text-slate-100 px-3.5 py-2 rounded-lg border border-indigo-500/20 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
            >
              <span className="text-cyan-400">⚡</span>
              <span>{activeOption.name}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#121422] border border-indigo-500/30 rounded-xl shadow-2xl py-2 z-40 max-h-96 overflow-y-auto backdrop-blur-xl">
                {TEMPLATE_OPTIONS.map((opt) => {
                  const isCur = opt.id === selectedTemplate;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectTemplate(opt.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                        isCur ? "bg-cyan-950/30 border-l-2 border-cyan-400" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCur ? "text-cyan-300" : "text-slate-100"}`}>
                            {opt.name}
                          </span>
                          {opt.badge && (
                            <span className="text-[9px] font-extrabold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{opt.desc}</p>
                      </div>
                      {isCur && (
                        <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="text-[11px] font-semibold text-slate-400 bg-[#141624] px-3 py-2 rounded-lg border border-indigo-500/15">
            US English
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-cyan-300 font-semibold text-xs px-3.5 py-2 rounded-lg border border-cyan-500/30 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <span>{copied ? "Copied to Clipboard!" : "Copy Summary"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Neural AI Banner */}
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-transparent border border-indigo-500/20 px-4 py-2.5 rounded-lg text-xs text-indigo-200">
        <span className="text-cyan-400">✦</span>
        <span>Hearken AI synthesizes action points, decisions, and speaker intent automatically.</span>
      </div>

      {isGenerating ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Synthesizing {activeOption.name} with Hearken AI...</p>
        </div>
      ) : currentSummary?.content ? (
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 space-y-4 pt-2">
          {currentSummary.content.split("\n\n").map((block, idx) => {
            const trimmed = block.trim();

            const isHeader =
              !trimmed.includes("\n") &&
              !trimmed.startsWith("-") &&
              !trimmed.startsWith("*") &&
              trimmed.length > 0 &&
              trimmed.length < 50 &&
              !trimmed.endsWith(".") &&
              !trimmed.endsWith(",");

            if (isHeader) {
              return (
                <div key={idx} className="pt-2">
                  <h4 className="text-sm font-bold text-slate-100 tracking-wide border-b border-indigo-500/15 pb-1.5 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</span>
                  </h4>
                </div>
              );
            }

            if (block.includes("\n- ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              const bullets = block.split("\n").filter((l) => l.trim());
              return (
                <ul key={idx} className="space-y-2 text-xs text-slate-300 pl-2">
                  {bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{b.replace(/^[-*]\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-xs text-slate-300 leading-relaxed pl-2">
                {block}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-xs">
          No neural summary available for this template.
        </div>
      )}
    </div>
  );
}