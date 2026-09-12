import { supabaseAdmin } from "../src/lib/supabase-admin";
import { generateTranscript, generateSummary } from "../src/lib/gemini";

// Each entry here becomes one seeded meeting. "description" is what we hand
// to Gemini to write the fake dialogue — the more specific, the more
// realistic the output.
const MEETINGS = [
  {
    title: "1:1 - Career Check-in",
    meeting_type: "one_on_one",
    participant_count: 2,
    participants: ["Sarah Chen", "Marcus Webb"],
    duration_minutes: 20,
    description:
      "A 1:1 meeting between a manager (Sarah) and her report (Marcus) discussing recent project performance, career growth goals, and a request for more ownership on the upcoming redesign project. 20 minutes long.",
  },
  {
    title: "1:1 - Q3 Roadmap Sync",
    meeting_type: "one_on_one",
    participant_count: 2,
    participants: ["Alice Kim", "Bob Torres"],
    duration_minutes: 15,
    description:
      "A short 1:1 between two product people discussing Q3 roadmap priorities, agreeing to focus on mobile app improvements, with a follow-up deadline. 15 minutes long.",
  },
  {
    title: "Sales Call - Acme Corp Demo",
    meeting_type: "sales",
    participant_count: 3,
    participants: ["Jordan Ellis (Sales)", "Priya Nair (Acme, VP Ops)", "Tom Reyes (Acme, IT Lead)"],
    duration_minutes: 30,
    description:
      "A sales demo call where a salesperson (Jordan) demos a product to two prospects from Acme Corp (Priya, VP Ops, and Tom, IT Lead). Priya raises pricing concerns and asks about integration timelines, Tom raises a security/compliance objection. Ends with a tentative next-steps agreement. 30 minutes long.",
  },
  {
    title: "Engineering Standup",
    meeting_type: "standup",
    participant_count: 4,
    participants: ["Dana Fox", "Leo Park", "Mia Santos", "Ravi Patel"],
    duration_minutes: 12,
    description:
      "A daily engineering standup with 4 developers going around discussing what they finished yesterday, what they're working on today, and one person raising a blocker about a flaky CI pipeline. 12 minutes long.",
  },
  {
    title: "Product Kickoff - Notifications Revamp",
    meeting_type: "enhanced",
    participant_count: 5,
    participants: ["Nina Osei", "Chris Blake", "Amara Diallo", "Ken Ito", "Lucia Fernandez"],
    duration_minutes: 40,
    description:
      "A project kickoff meeting for a notifications system revamp, with a PM, a designer, two engineers, and a data analyst discussing scope, initial design direction, technical constraints, and rough timeline. Some disagreement about scope that gets resolved by the end. 40 minutes long.",
  },
  {
  title: "Cross-team Planning - Q4 Launch",
  meeting_type: "enhanced",
  participant_count: 8,
  participants: [
    "Sarah Chen", "Marcus Webb", "Priya Nair", "Tom Reyes",
    "Dana Fox", "Leo Park", "Nina Osei", "Chris Blake",
  ],
  duration_minutes: 55,
  description:
  `A cross-team planning meeting with 8 people (product, engineering, design, and sales) discussing the Q4 launch plan for a new feature. This is a LONG meeting — you must write at least 100 lines of dialogue, ideally 120-150. Do not compress the discussion into a few quick exchanges. Instead, have MULTIPLE topics discussed in detail, each with several people weighing in, asking clarifying questions, going back and forth before reaching a conclusion. Cover at least 5 distinct discussion topics (e.g., timeline, feature scope, design handoff, QA/testing plan, rollout/marketing coordination), each getting real back-and-forth, not a single exchange.

  This should feel like a REAL, slightly chaotic meeting, not a polished summary. Specifically include:
  - At least 4 moments where one person is cut off mid-sentence (ending with "—") and another person immediately jumps in as a SEPARATE line with its own timestamp
  - At least 2 moments where two people nearly talk over each other, as separate consecutive lines with close but not identical timestamps, one saying "sorry, go ahead" or similar
  - Filler words and real speech patterns: "um", "yeah so", "I mean", trailing off with "..."
  - One clear disagreement between engineering and sales about the timeline that runs for several exchanges before a PM redirects
  - One off-topic tangent that runs 3-5 lines before someone brings the group back
  - Someone repeating part of what they just said because they got talked over
  - Natural imprecision: unfinished thoughts, one-word acknowledgments, someone asking "wait, what did you say?"

  Do not wrap up early. Keep the discussion going through all 5 topics before reaching final agreement on next steps and owners. 55 minutes long, MINIMUM 100 lines of dialogue — this is a strict requirement.`,
  },
];

const TEMPLATES = ["enhanced", "sales", "standup", "one_on_one"];

// Gemini writes transcripts as "[MM:SS] Speaker: text" lines. This turns
// that plain text into structured rows matching our transcript_lines table.
function parseTranscript(raw: string) {
  const lines = raw.split("\n").filter((l) => l.trim());
  const parsed = lines
    .map((line, i) => {
      const match = line.match(/^\[(\d+):(\d+)\]\s*([^:\[\]]+):\s*(.+)$/);
      if (!match) return null;
      const [, mm, ss, speaker, text] = match;
      const cleanedText = text.replace(/^\[\d+:\d+\]\s*/, "").trim();
      const cleanedSpeaker = speaker.trim();

      if (!cleanedSpeaker || cleanedSpeaker.length > 40) return null;

      return {
        speaker: cleanedSpeaker,
        timestamp_seconds: parseInt(mm) * 60 + parseInt(ss),
        text: cleanedText,
        line_order: i,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return { parsed, droppedCount: lines.length - parsed.length };
}

async function seedMeeting(meetingConfig: (typeof MEETINGS)[number]) {
  console.log(`\n--- Seeding: ${meetingConfig.title} ---`);

  // 1. Generate transcript FIRST, before creating the meeting row
  console.log("Generating transcript...");
  const rawTranscript = await generateTranscript(meetingConfig.description, meetingConfig.duration_minutes);
  const { parsed: parsedLines, droppedCount } = parseTranscript(rawTranscript);
  if (droppedCount > 0) console.log(`  (dropped ${droppedCount} malformed line(s))`);

  if (parsedLines.length === 0) {
    console.error("Transcript parsing produced 0 lines — raw output was:\n", rawTranscript);
    return;
  }

  // 2. Derive the REAL participant list from actual speakers in the transcript
  const actualParticipants = Array.from(new Set(parsedLines.map((l) => l.speaker)));

  // 3. Now insert the meeting row using the real speaker list
  const { data: meetingRow, error: meetingErr } = await supabaseAdmin
    .from("meetings")
    .insert({
      title: meetingConfig.title,
      meeting_date: new Date().toISOString(),
      duration_minutes: meetingConfig.duration_minutes,
      participant_count: actualParticipants.length,
      participants: actualParticipants,
      meeting_type: meetingConfig.meeting_type,
    })
    .select()
    .single();

  if (meetingErr || !meetingRow) {
    console.error("Failed to insert meeting:", meetingErr);
    return;
  }
  console.log(`Meeting created: ${meetingRow.id} (${actualParticipants.length} speakers: ${actualParticipants.join(", ")})`);

  // 4. Insert transcript lines
  const { error: linesErr } = await supabaseAdmin.from("transcript_lines").insert(
    parsedLines.map((line) => ({ ...line, meeting_id: meetingRow.id }))
  );
  if (linesErr) console.error("Failed to insert transcript lines:", linesErr);
  else console.log(`Inserted ${parsedLines.length} transcript lines`);

  const fullTranscriptText = parsedLines.map((l) => `${l.speaker}: ${l.text}`).join("\n");

  // 5. Generate summary (unchanged from before)
  console.log(`Generating "${meetingConfig.meeting_type}" summary...`);
  try {
    const { summary, actionItems } = await generateSummary(fullTranscriptText, meetingConfig.meeting_type);

    await supabaseAdmin.from("summaries").insert({
      meeting_id: meetingRow.id,
      template: meetingConfig.meeting_type,
      content: summary,
    });

    if (actionItems?.length) {
      await supabaseAdmin.from("action_items").insert(
        actionItems.map((item: { text: string; owner: string | null }) => ({
          meeting_id: meetingRow.id,
          text: item.text,
          owner: item.owner,
        }))
      );
      console.log(`Inserted ${actionItems.length} action items`);
    }
  } catch (err) {
    console.error(`Failed generating summary:`, err);
  }

  // 6. Highlight (unchanged)
  if (parsedLines.length > 4) {
    const midLine = parsedLines[Math.floor(parsedLines.length / 2)];
    const { data: insertedLine } = await supabaseAdmin
      .from("transcript_lines")
      .select("id")
      .eq("meeting_id", meetingRow.id)
      .eq("line_order", midLine.line_order)
      .single();

    if (insertedLine) {
      await supabaseAdmin.from("highlights").insert({
        meeting_id: meetingRow.id,
        transcript_line_id: insertedLine.id,
        note: "Key moment",
      });
      console.log("Added 1 highlight");
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function seed() {
  for (const meeting of MEETINGS) {
    await seedMeeting(meeting);
  }
  console.log("\n✅ Seeding complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });