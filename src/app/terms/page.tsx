import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms of Service — Hearken",
  description: "Terms of Service for Hearken AI Meeting Note Taker. Understand your rights, meeting recording responsibilities, and service guidelines.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="w-full bg-[#0d0f18]/80 backdrop-blur-xl px-6 lg:px-12 py-4 flex items-center justify-between border-b border-indigo-500/10 sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 lg:px-12 py-12 lg:py-16 flex flex-col gap-10">
        {/* Title & Metadata */}
        <div className="flex flex-col gap-4 border-b border-indigo-500/15 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-medium w-fit">
            <span>Last Updated: September 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using Hearken AI Meeting Assistant (&quot;Hearken&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;).
            By accessing or using our platform, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Key Summary Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111322] to-[#151829] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Summary of Key Principles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">Recording Consent</span>
              <span className="text-slate-400">You must obtain all legally required consents from meeting participants before recording calls.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">Content Ownership</span>
              <span className="text-slate-400">You retain all intellectual property rights to your audio, transcripts, notes, and summaries.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">Fair &amp; Lawful Use</span>
              <span className="text-slate-400">Hearken may not be used for unauthorized surveillance, harassment, or unlawful wiretapping.</span>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="flex flex-col gap-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">1.</span> Acceptance of Terms
            </h2>
            <p>
              By creating an account, connecting your Google Calendar, dispatching a meeting notetaker bot, or browsing any page on Hearken, you agree to comply with and be legally bound by these Terms of Service and our{" "}
              <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300">
                Privacy Policy
              </Link>. If you do not agree to these Terms, you must not access or use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">2.</span> Service Description &amp; Notetaker Bot
            </h2>
            <p>
              Hearken provides AI-powered meeting productivity tools, including:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>Automated notetaker bot dispatch into video conferences (Google Meet, Zoom, Microsoft Teams).</li>
              <li>Audio recording, speech-to-text processing, and speaker diarization.</li>
              <li>AI-generated multi-template summaries, action item extraction, and conversational Q&amp;A assistants.</li>
              <li>Google Calendar synchronization for upcoming call monitoring.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">3.</span> Meeting Recording &amp; Participant Consent Obligations
            </h2>
            <div className="bg-[#111320] p-4 rounded-xl border border-indigo-500/20 flex flex-col gap-2 text-slate-300">
              <strong className="text-cyan-300">Your Legal Obligation:</strong>
              <p className="text-slate-400 text-xs leading-relaxed">
                Recording audio and video conversations is subject to various international, federal, state, and local wiretapping and consent laws (including one-party and all-party consent jurisdictions).
                You are solely responsible for notifying all participants and obtaining all necessary legal consents prior to inviting or dispatching the Hearken notetaker bot into any call.
              </p>
            </div>
            <p className="text-slate-400">
              Hearken bots are configured with identifiable names (e.g. &quot;Hearken Notetaker&quot;) and display recording indicators where supported by video platforms.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">4.</span> User Accounts &amp; Google OAuth
            </h2>
            <p>
              To access personalized meeting management features, you authenticate using Google OAuth. You are responsible for maintaining the security of your Google account credentials.
              You agree to notify us immediately of any unauthorized access or security breach involving your account.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">5.</span> Intellectual Property &amp; Content Ownership
            </h2>
            <p>
              <strong className="text-slate-200">Your Content:</strong> You retain all ownership and intellectual property rights in and to your meeting audio recordings, transcripts, summaries, live notes, and queries.
              Hearken does not claim any ownership over your meeting data.
            </p>
            <p>
              <strong className="text-slate-200">Platform IP:</strong> Hearken, its brand name, logos, visual designs, user interfaces, algorithms, and source code are the proprietary intellectual property of Hearken and its licensors.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">6.</span> AI-Generated Content Disclaimer
            </h2>
            <p>
              Hearken utilizes advanced generative AI models (Google Gemini AI) to produce summaries, extract action items, and answer queries.
              While we strive for high accuracy:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>AI outputs may occasionally contain inaccuracies, hallucinations, or incomplete context.</li>
              <li>You should review critical action items, commitments, or financial/legal details against original audio or full transcripts before making important decisions.</li>
              <li>AI summaries and responses do not constitute formal legal, financial, medical, or professional advice.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">7.</span> Prohibited Activities
            </h2>
            <p>When using Hearken, you agree not to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>Use the Service for covert, unlawful, or unauthorized surveillance or wiretapping.</li>
              <li>Attempt to reverse engineer, decompile, or copy the Service&apos;s proprietary architecture or software.</li>
              <li>Abuse, overload, or disrupt the Service, third-party APIs (Google Calendar, Gemini AI, Meeting BaaS), or associated servers.</li>
              <li>Circumvent or tamper with authentication, Row Level Security policies, or access controls.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">8.</span> Limitation of Liability
            </h2>
            <p className="text-slate-400">
              To the maximum extent permitted by applicable law, Hearken and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business interruption arising out of your use of or inability to use the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">9.</span> Termination &amp; Modifications
            </h2>
            <p>
              We reserve the right to modify or discontinue features of the Service or update these Terms periodically. Continued use of Hearken following notice of changes constitutes acceptance of the modified Terms.
              You may terminate your agreement at any time by discontinuing use of the Service and deleting your account data.
            </p>
          </section>

          {/* Section 10 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">10.</span> Contact Us
            </h2>
            <p>
              If you have any questions, feedback, or legal inquiries regarding these Terms of Service, please reach out to:
            </p>
            <div className="p-4 rounded-xl bg-[#111320] border border-indigo-500/20 flex flex-col gap-1 w-fit">
              <span className="font-semibold text-slate-200">Hearken AI Legal &amp; Support Team</span>
              <a href="mailto:vibecoding240@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                vibecoding240@gmail.com
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 lg:px-12 text-center text-xs text-slate-500 border-t border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <span>© {new Date().getFullYear()} Hearken AI — AI Meeting Assistant. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            Home
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
