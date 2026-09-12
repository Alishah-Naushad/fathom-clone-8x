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
      "A cross-team planning meeting with 8 people (product, engineering, design, and sales) discussing the Q4 launch plan for a new feature. Includes some crosstalk, a few tangents, disagreement about timeline between engineering and sales, and ends with agreed next steps and owners assigned. Natural, slightly messy real-meeting energy with people occasionally talking over each other. 55 minutes long.",
  },
];

const TEMPLATES = ["enhanced", "sales", "standup", "one_on_one"];

// Gemini writes transcripts as "[MM:SS] Speaker: text" lines. This turns
// that plain text into structured rows matching our transcript_lines table.
function parseTranscript(raw: string) {
  const lines = raw.split("\n").filter((l) => l.trim());
  return lines
    .map((line, i) => {
      const match = line.match(/^\[(\d+):(\d+)\]\s*([^:]+):\s*(.+)$/);
      if (!match) return null;
      const [, mm, ss, speaker, text] = match;
      return {
        speaker: speaker.trim(),
        timestamp_seconds: parseInt(mm) * 60 + parseInt(ss),
        text: text.trim(),
        line_order: i,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

async function seedMeeting(meeting: (typeof MEETINGS)[number]) {
  console.log(`\n--- Seeding: ${meeting.title} ---`);

  // 1. Insert the meeting row itself
  const { data: meetingRow, error: meetingErr } = await supabaseAdmin
    .from("meetings")
    .insert({
      title: meeting.title,
      meeting_date: new Date().toISOString(),
      duration_minutes: meeting.duration_minutes,
      participant_count: meeting.participant_count,
      participants: meeting.participants,
      meeting_type: meeting.meeting_type,
    })
    .select()
    .single();

  if (meetingErr || !meetingRow) {
    console.error("Failed to insert meeting:", meetingErr);
    return;
  }
  console.log(`Meeting created: ${meetingRow.id}`);

  // 2. Generate a fake transcript via Gemini
  console.log("Generating transcript...");
  const rawTranscript = await generateTranscript(meeting.description);
  const parsedLines = parseTranscript(rawTranscript);

  if (parsedLines.length === 0) {
    console.error("Transcript parsing produced 0 lines — raw output was:\n", rawTranscript);
    return;
  }

  // 3. Insert transcript lines
  const { error: linesErr } = await supabaseAdmin.from("transcript_lines").insert(
    parsedLines.map((line) => ({ ...line, meeting_id: meetingRow.id }))
  );
  if (linesErr) console.error("Failed to insert transcript lines:", linesErr);
  else console.log(`Inserted ${parsedLines.length} transcript lines`);

  // Full transcript text, used as input for summarization
  const fullTranscriptText = parsedLines
    .map((l) => `${l.speaker}: ${l.text}`)
    .join("\n");

  // 4. Generate a summary + action items for EVERY template, not just the
  // meeting's default one — this is what makes your template switcher
  // actually show different content when clicked, instead of the same
  // summary relabeled.
  for (const template of TEMPLATES) {
    console.log(`Generating "${template}" summary...`);
    try {
      const { summary, actionItems } = await generateSummary(fullTranscriptText, template);

      const { error: summaryErr } = await supabaseAdmin.from("summaries").insert({
        meeting_id: meetingRow.id,
        template,
        content: summary,
      });
      if (summaryErr) console.error(`Failed to insert ${template} summary:`, summaryErr);

      // Only insert action items once (from the meeting's own default
      // template) — otherwise you'd get 4x duplicate action item lists,
      // one per template, which makes no sense in the UI.
      if (template === meeting.meeting_type && actionItems?.length) {
        const { error: actionErr } = await supabaseAdmin.from("action_items").insert(
          actionItems.map((item: { text: string; owner: string | null }) => ({
            meeting_id: meetingRow.id,
            text: item.text,
            owner: item.owner,
          }))
        );
        if (actionErr) console.error("Failed to insert action items:", actionErr);
        else console.log(`Inserted ${actionItems.length} action items`);
      }
    } catch (err) {
      console.error(`Failed generating "${template}" summary:`, err);
    }
  }

  // 5. Add one highlight on a middle-ish line, so the highlight feature
  // has real seeded data to show off, not just an empty state.
  if (parsedLines.length > 4) {
    const midLine = parsedLines[Math.floor(parsedLines.length / 2)];
    const { data: insertedLines } = await supabaseAdmin
      .from("transcript_lines")
      .select("id")
      .eq("meeting_id", meetingRow.id)
      .eq("line_order", midLine.line_order)
      .single();

    if (insertedLines) {
      await supabaseAdmin.from("highlights").insert({
        meeting_id: meetingRow.id,
        transcript_line_id: insertedLines.id,
        note: "Key moment",
      });
      console.log("Added 1 highlight");
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 5000)); // pause before next meeting
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