"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AskFathomTabProps {
  transcriptText: string;
  summaryText?: string;
}

const SUGGESTED_PROMPTS = [
  "Propose insightful follow-up questions",
  "Detail all timelines & deadlines discussed",
  "Summarize key decisions & consensus",
  "Describe stakeholder perspectives & objections",
];

export default function AskFathomTab({
  transcriptText,
  summaryText,
}: AskFathomTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask-fathom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
          summary: summaryText,
          question: textToSend.trim(),
        }),
      });

      const data = await res.json();
      if (data?.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.error || "I couldn't generate an answer. Please try again.",
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, an error occurred while connecting to Hearken AI.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[480px] justify-between py-4">
      {/* Messages area or Greeting Hero */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[440px] pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center my-auto py-8 gap-5">
            {/* Center Hearken Voice Orb */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/25 to-purple-500/20 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
              <div className="flex items-center gap-1 h-6">
                <span className="w-1 h-4 bg-cyan-400 rounded-full" />
                <span className="w-1 h-6 bg-indigo-400 rounded-full" />
                <span className="w-1 h-5 bg-cyan-300 rounded-full" />
                <span className="w-1 h-2.5 bg-purple-400 rounded-full" />
              </div>
            </div>

            {/* Greeting Text */}
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-slate-100 tracking-normal">
                Hearken AI Meeting Assistant
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Ask questions, summarize key decisions, or extract action items from this meeting.
              </p>
            </div>

            {/* Suggested Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md pt-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="p-3 text-left text-xs text-slate-300 bg-[#121422] hover:bg-[#181b2e] border border-indigo-500/20 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-cyan-400 text-[11px] font-semibold">
                    <span>✦</span>
                    <span>Prompt</span>
                  </div>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-slate-950 font-black text-[10px]">
                    H
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 text-slate-100 border border-cyan-500/40 shadow-sm"
                      : "bg-[#131522] text-slate-200 border border-indigo-500/20 whitespace-pre-wrap shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-cyan-300 pl-9">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Hearken is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative mt-4 flex items-center bg-[#131522] rounded-xl border border-indigo-500/30 focus-within:border-cyan-400/60 transition-colors shadow-inner"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Hearken AI anything about this conversation..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 pl-4 pr-12 py-3 rounded-xl focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`absolute right-2 p-2 rounded-lg flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:brightness-110 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
          title="Send message"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </form>
    </div>
  );
}
