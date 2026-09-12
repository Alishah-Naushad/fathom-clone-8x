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
  {
    id: "enhanced",
    name: "Enhanced",
    badge: "FREE",
    desc: "Capture any call's insights and key takeaways.",
    icon: "message",
  },
  {
    id: "sales",
    name: "Sales",
    desc: "Unpack a prospect's needs, challenges, and buying journey.",
    icon: "chart",
  },
  {
    id: "standup",
    name: "Engineering Standup",
    desc: "What was completed, what's planned next, and blockers.",
    icon: "users",
  },
  {
    id: "one_on_one",
    name: "1:1 Meeting",
    desc: "Main topics discussed, feedback given, and career growth.",
    icon: "smile",
  },
  {
    id: "sales_meddpicc",
    name: "Sales - MEDDPICC",
    desc: "Notes based on the popular sales methodology.",
    icon: "trend",
  },
  {
    id: "customer_success",
    name: "Customer Success",
    desc: "Experiences, challenges, goals, and Q&A.",
    icon: "smile",
  },
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

  // Find summary matching selected template
  const currentSummary = summaries.find(
    (s) => s.template.toLowerCase() === selectedTemplate.toLowerCase()
  ) || summaries[0];

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setDropdownOpen(false);

    // Check if summary for this template already exists
    const existing = summaries.find(
      (s) => s.template.toLowerCase() === templateId.toLowerCase()
    );

    if (!existing && transcriptText) {
      // Generate on-the-fly via /api/summarize
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
          // Store in Supabase
          const { data: inserted } = await supabase
            .from("summaries")
            .insert({
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
      {/* Top Toolbar: Template Selector, Language Pill, Copy Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-[#202126] hover:bg-[#282a32] text-xs font-semibold text-white px-3 py-1.5 rounded border border-[#32343d] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[#00beff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{activeOption.name}</span>
              <svg className="w-3 h-3 text-[#80858e]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Template Dropdown Menu (matching screenshot 4) */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-[#212328] border border-[#383a42] rounded-lg shadow-2xl py-2 z-40 max-h-96 overflow-y-auto">
                {TEMPLATE_OPTIONS.map((opt) => {
                  const isCur = opt.id === selectedTemplate;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectTemplate(opt.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isCur
                          ? "bg-[#183446] border-l-2 border-[#00beff]"
                          : "hover:bg-[#282a30]"
                      }`}
                    >
                      <div className="mt-0.5 text-[#80858e]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCur ? "text-[#00beff]" : "text-white"}`}>
                            {opt.name}
                          </span>
                          {opt.badge && (
                            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-1 rounded">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#80858e] leading-snug mt-0.5">
                          {opt.desc}
                        </p>
                      </div>

                      {isCur && (
                        <svg className="w-4 h-4 text-[#00beff] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language pill */}
          <span className="text-[11px] font-semibold text-[#80858e] bg-[#202126] px-2.5 py-1.5 rounded border border-[#32343d]">
            US EN
          </span>
        </div>

        {/* Copy Summary Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-[#1b2b38] hover:bg-[#203648] text-[#00beff] font-semibold text-xs px-3 py-1.5 rounded border border-[#00beff]/30 transition-all cursor-pointer shadow-sm"
        >
          <span>{copied ? "Copied!" : "Copy Summary"}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Feature notice banner (matching screenshot 3) */}
      <div className="flex items-center gap-2 bg-[#2d2511] border border-[#785b1c] px-3 py-2 rounded text-xs text-[#eab308] font-medium">
        <span>✨</span>
        <span>NEW: Customize this summary by selecting different templates above</span>
      </div>

      {/* Summary Content Body */}
      {isGenerating ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-[#80858e]">
          <div className="w-6 h-6 border-2 border-[#00beff] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Generating {activeOption.name} summary with Gemini AI...</p>
        </div>
      ) : currentSummary?.content ? (
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/90 space-y-3 pt-2">
          {currentSummary.content.split("\n\n").map((block, idx) => {
            if (block.startsWith("#") || block.includes("Meeting Purpose") || block.includes("Key Takeaways") || block.includes("Topics") || block.includes("TL;DR") || block.includes("Decisions Made")) {
              return (
                <div key={idx} className="pt-2">
                  <h4 className="text-sm font-bold text-white tracking-wide border-b border-[#28292d] pb-1 mb-2">
                    {block.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                  </h4>
                </div>
              );
            }

            if (block.includes("\n- ") || block.startsWith("- ") || block.startsWith("* ")) {
              const bullets = block.split("\n").filter((l) => l.trim());
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs text-white/85">
                  {bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b.replace(/^[-*]\s*/, "")}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-xs text-white/85 leading-relaxed">
                {block}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-[#80858e] text-xs">
          No summary available for this template.
        </div>
      )}
    </div>
  );
}
