import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — Hearken",
  description: "Privacy Policy for Hearken AI Meeting Note Taker. Learn how we handle your meeting data, Google Calendar access, transcripts, and AI summarization securely.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            At Hearken (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we take your privacy and meeting confidentiality seriously.
            This Privacy Policy explains how your information is collected, processed, and safeguarded when using Hearken AI Meeting Assistant.
          </p>
        </div>

        {/* Key Guarantees Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111322] to-[#151829] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Our Core Privacy Commitments</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">No Model Training</span>
              <span className="text-slate-400">Your meeting audio, transcripts, and notes are never used to train foundation AI models.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">Row Level Security</span>
              <span className="text-slate-400">Database rows are isolated strictly to your authenticated account via Supabase RLS.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090a10]/60 border border-indigo-500/10 flex flex-col gap-1">
              <span className="font-semibold text-cyan-300">Full Ownership</span>
              <span className="text-slate-400">You retain 100% ownership of your recordings and can delete or export data anytime.</span>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="flex flex-col gap-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">1.</span> Information We Collect
            </h2>
            <p>
              When you use Hearken, we collect information necessary to provide meeting transcription, automated note generation, and calendar synchronization:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Google Account &amp; Profile:</strong> Your name, email address, and profile picture provided during Google OAuth authentication.
              </li>
              <li>
                <strong className="text-slate-200">Google Calendar Data:</strong> With your explicit consent, we access read-only calendar event details (meeting titles, scheduled times, attendees, and meeting links like Google Meet, Zoom, or Microsoft Teams) to show your upcoming calls and enable notetaker dispatch.
              </li>
              <li>
                <strong className="text-slate-200">Meeting Audio &amp; Transcripts:</strong> When a Hearken notetaker bot joins an authorized meeting, audio streams are recorded and processed into speaker-diarized text transcripts.
              </li>
              <li>
                <strong className="text-slate-200">User-Generated Content:</strong> Live highlights, meeting summaries, task checklists, and conversational queries sent to the &quot;Ask Hearken&quot; assistant.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">2.</span> How We Use Your Information
            </h2>
            <p>We use the collected information solely to operate and improve the Hearken application:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>Facilitating automated bot entry into user-authorized video conferences.</li>
              <li>Transcribing spoken dialogue with accurate speaker separation and timestamps.</li>
              <li>Generating structured summaries (Executive Summary, Sales Demo, Standup, 1:1) and action items via Google Gemini AI.</li>
              <li>Enabling keyword and cross-meeting transcript search.</li>
              <li>Powering grounded RAG (Retrieval-Augmented Generation) Q&amp;A on specific meeting recordings.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">3.</span> AI Processing &amp; Model Training Disclosure
            </h2>
            <p className="bg-[#111320] p-4 rounded-xl border border-indigo-500/20 text-slate-300">
              <strong>Zero Model Training Guarantee:</strong> Hearken uses Google Gemini API to synthesize summaries and answer user queries.
              Under our enterprise API configuration, your transcripts, prompts, and meeting data are <span className="text-cyan-300 font-semibold">NOT used to train or fine-tune Google&apos;s or any third-party foundation AI models</span>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">4.</span> Google API Limited Use Compliance
            </h2>
            <p>
              Hearken&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>We only request the minimal read-only calendar scope (<code className="text-cyan-300 text-xs bg-slate-900 px-1.5 py-0.5 rounded">calendar.events.readonly</code>) required to display upcoming calls.</li>
              <li>We do not sell Google user data to third parties, advertising platforms, or data brokers.</li>
              <li>Human access to user calendar data is prohibited unless explicitly authorized by the user for technical troubleshooting.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">5.</span> Data Storage &amp; Security
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical security safeguards:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Row-Level Isolation:</strong> Data stored in Supabase PostgreSQL is protected by Row Level Security (RLS) policies enforcing that only the meeting owner can read, update, or query records.
              </li>
              <li>
                <strong className="text-slate-200">Encryption:</strong> All data is encrypted in transit via TLS 1.3 and at rest using AES-256 encryption.
              </li>
              <li>
                <strong className="text-slate-200">Service Role Protection:</strong> Server-side API routes and webhook handlers utilize strictly managed backend service keys that are never exposed to client applications.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">6.</span> Third-Party Service Providers
            </h2>
            <p>Hearken partners with trusted sub-processors to deliver core functionality:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#111320] border border-indigo-500/15">
                <h4 className="font-semibold text-slate-200 text-xs">Supabase</h4>
                <p className="text-slate-400 text-xs mt-1">Authentication, PostgreSQL database hosting, and secure user session management.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111320] border border-indigo-500/15">
                <h4 className="font-semibold text-slate-200 text-xs">Meeting BaaS &amp; Gladia</h4>
                <p className="text-slate-400 text-xs mt-1">Meeting bot streaming, audio recording infrastructure, and speech-to-text transcription.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111320] border border-indigo-500/15">
                <h4 className="font-semibold text-slate-200 text-xs">Google Gemini AI</h4>
                <p className="text-slate-400 text-xs mt-1">Natural language processing, multi-template meeting summaries, and grounded Q&amp;A synthesis.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111320] border border-indigo-500/15">
                <h4 className="font-semibold text-slate-200 text-xs">Google Calendar API</h4>
                <p className="text-slate-400 text-xs mt-1">Read-only retrieval of upcoming meetings and video conference links.</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">7.</span> Your Rights &amp; Data Deletion
            </h2>
            <p>You have full control over your personal data:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Delete Meetings:</strong> You can delete any individual meeting, audio file, or transcript from your library at any time.
              </li>
              <li>
                <strong className="text-slate-200">Revoke Calendar Access:</strong> You can disconnect Google Calendar sync or revoke Hearken permissions directly from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Google Security Settings
                </a>.
              </li>
              <li>
                <strong className="text-slate-200">Account Deletion:</strong> You may request complete deletion of your account and all associated meeting vaults by contacting us.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">8.</span> Contact Us
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or your data, please contact our privacy team:
            </p>
            <div className="p-4 rounded-xl bg-[#111320] border border-indigo-500/20 flex flex-col gap-1 w-fit">
              <span className="font-semibold text-slate-200">Hearken AI Privacy Team</span>
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
          <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
