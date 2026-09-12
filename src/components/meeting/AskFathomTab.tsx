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
  "Detail all timelines discussed",
  "What would help make progress?",
  "Describe the key stakeholders?",
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
          content: "Sorry, an error occurred while connecting to Fathom AI.",
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
            {/* Center Fathom Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-[#202228] border border-[#30333c] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#00beff]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5zm3.5-5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5zm4.5-5c0-.83.67-1.5 1.5-1.5h4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H13.5c-.83 0-1.5-.67-1.5-1.5z" />
              </svg>
            </div>

            {/* Greeting Text */}
            <h3 className="text-base font-bold text-white tracking-normal">
              Hi, what can I tell you about this meeting?
            </h3>

            {/* Suggested Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md pt-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="p-3 text-left text-xs text-white/90 bg-[#202126] hover:bg-[#282a32] border border-[#2e3038] hover:border-[#00beff]/50 rounded-lg transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
                >
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
                  <div className="w-6 h-6 rounded-full bg-[#1b2b38] border border-[#00beff]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#00beff]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 14.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5zm3.5-5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5zm4.5-5c0-.83.67-1.5 1.5-1.5h4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H13.5c-.83 0-1.5-.67-1.5-1.5z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                    m.role === "user"
                      ? "bg-[#183446] text-white border border-[#00beff]/30"
                      : "bg-[#202126] text-white/90 border border-[#2e3038] whitespace-pre-wrap"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#80858e] pl-9">
                <div className="w-4 h-4 border-2 border-[#00beff] border-t-transparent rounded-full animate-spin" />
                <span>Thinking...</span>
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
        className="relative mt-4 flex items-center bg-[#202126] rounded-lg border border-[#30333c] focus-within:border-[#00beff]/60 transition-colors"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Fathom AI"
          className="w-full bg-transparent text-xs text-white placeholder-[#80858e] pl-3.5 pr-11 py-2.5 rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`absolute right-1.5 p-1.5 rounded-md flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? "bg-[#00beff] text-black hover:bg-[#00a8e6] cursor-pointer"
              : "bg-[#2d2f36] text-[#80858e] cursor-not-allowed"
          }`}
          title="Send"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </form>
    </div>
  );
}
