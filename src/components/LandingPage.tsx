"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase-browser";

interface LandingPageProps {
  onSignInClick?: () => void;
}

export default function LandingPage({ onSignInClick }: LandingPageProps) {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes:
          "openid email profile https://www.googleapis.com/auth/calendar.events.readonly",
        queryParams: {
          access_type: "offline",
        },
      },
    });
  };

  const features = [
    {
      icon: "📅",
      title: "Google Calendar Sync",
      desc: "Connect your calendar with one click to see all upcoming meetings and send automated notetakers.",
    },
    {
      icon: "🔴",
      title: "Live Call Monitoring",
      desc: "Watch your notetaker in real-time, view live recording timers, and take instant timestamped highlights.",
    },
    {
      icon: "📝",
      title: "Multi-Template Summaries",
      desc: "Switch between Executive Summaries, Sales Intelligence, Engineering Standups, and 1:1 Check-ins.",
    },
    {
      icon: "⚡",
      title: "Synced Audio & Transcripts",
      desc: "Listen with full playback controls and click any spoken line to jump to that exact second.",
    },
    {
      icon: "🤖",
      title: "Ask Hearken AI",
      desc: "Conversational Q&A assistant grounded in your meeting transcript to answer questions instantly.",
    },
    {
      icon: "📋",
      title: "Action Item Detection",
      desc: "Automatically extracts follow-up tasks and assigned owners with interactive completion checkboxes.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <header className="w-full bg-[#0d0f18]/80 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between border-b border-indigo-500/10 sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
          >
            Privacy Policy
          </Link>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Features (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold w-fit shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>AI Meeting Note Taker & Intelligence</span>
          </div>

          {/* Main Headline */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
              Never take meeting notes again. Let{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Hearken AI
              </span>{" "}
              listen, transcribe, & summarize.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Hearken joins your meetings, creates structured executive summaries,
              captures action items, and provides an instant conversational AI assistant for your entire meeting vault.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111320]/80 border border-indigo-500/15 hover:border-cyan-500/40 transition-all duration-300 shadow-md flex flex-col gap-2 hover:bg-[#151829]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{feat.icon}</span>
                  <h4 className="text-sm font-bold text-slate-100">{feat.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-8">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sign In Box (5 cols) */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#111322]/90 border border-indigo-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.12)] flex flex-col gap-6 relative overflow-hidden group">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Box Branding */}
            <div className="flex flex-col items-center text-center gap-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/25 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-1 h-5">
                  <span className="w-1 h-3.5 bg-cyan-400 rounded-full" />
                  <span className="w-1 h-5 bg-indigo-400 rounded-full" />
                  <span className="w-1 h-4 bg-cyan-300 rounded-full" />
                  <span className="w-1 h-2 bg-purple-400 rounded-full" />
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-100 tracking-tight">
                Welcome to Hearken
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Sign in with Google to sync your calendar, manage live calls, and view your meeting intelligence.
              </p>
            </div>

            {/* Google Sign In CTA Button */}
            <div className="flex flex-col gap-3 relative z-10 pt-2">
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {signingIn ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature Guarantees / Security Badges */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-indigo-500/15 relative z-10 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>Automatic Google Calendar meeting sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>Send AI Notetaker bot with one click</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>100% private, securely encrypted notes</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                By continuing, you agree to Hearken&apos;s{" "}
                <Link href="/terms" className="text-cyan-400 underline hover:text-cyan-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 lg:px-12 text-center text-xs text-slate-500 border-t border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <span>Hearken AI Meeting Assistant — Record, Transcribe, and Synthesize Meetings with Gemini AI.</span>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

