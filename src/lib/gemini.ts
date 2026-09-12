import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const TEMPLATE_PROMPTS: Record<string, string> = {
  enhanced: `Summarize this meeting transcript in this exact structure, using these exact section headers on their own line:

Meeting Purpose

One or two sentences on why this meeting happened.

Key Takeaways

- 3-5 bullet points, the most important outcomes or facts from the call

Topics

For each major topic discussed, write the topic name as its own line, then 2-4 bullet points under it with specifics.

Next Steps

- Bullet points, one per action, phrased as "Person: does what"`,

  sales: `Summarize this sales call in this exact structure, using these exact section headers on their own line. If something wasn't discussed, write "Not discussed." under that header — don't skip the header.

Prospect

Name and company if mentioned.

Call Context

One sentence on what this call was for.

Pain Points

The prospect's stated problems or needs.

Specific Requirements

- Bullet points of concrete asks or requirements mentioned

Objections

Any pushback, concerns, or hesitations raised.

Timeline

Any mentioned deadlines or urgency.

Next Steps

- Bullet points of agreed next actions

Questions We Asked

Questions the seller asked the prospect, or "None."

Questions They Asked

Questions the prospect asked, or "None."`,

  standup: `Summarize this standup transcript in this exact structure, using these exact section headers on their own line, grouped per person where relevant:

Progress Updates

For each person, one or two bullet points on what they completed.

Current Tasks

For each person, one or two bullet points on what they're working on next.

Impediments

Any blockers raised, or "None noted."`,

  one_on_one: `Summarize this 1:1 meeting in this exact structure, using these exact section headers on their own line:

Meeting Purpose

One sentence on what this 1:1 covered.

Updates

- Check-in: brief personal/work status if mentioned
- Progress on priorities since last meeting
- Priorities until next meeting
- Any blockers or requests for help, or "None indicated."

Topics

For each topic discussed, write the topic name as its own line, then 1-3 bullet points under it.

Next Steps

- Bullet points, one per action`,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429;
      if (!is429 || attempt === retries - 1) throw err;
      const waitMs = 8000 * (attempt + 1); // 8s, 16s, 24s backoff
      console.log(`Rate limited, waiting ${waitMs / 1000}s before retry...`);
      await sleep(waitMs);
    }
  }
  throw new Error("Unreachable");
}

export async function generateSummary(transcript: string, template: string) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `${TEMPLATE_PROMPTS[template] ?? TEMPLATE_PROMPTS.enhanced}

After the summary, on a new line, write exactly: ===ACTION_ITEMS===
Then list clear action items, one per line, in this format: text | owner
Use "none" for owner if not identifiable. If there are no action items, write exactly: none

Do not use JSON. Do not wrap anything in markdown code fences. Just write the summary directly, then the marker, then the action items.

Transcript:
${transcript}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const [summaryPart, actionItemsPart] = text.split("===ACTION_ITEMS===");
    const summary = (summaryPart ?? text).trim();

    const actionItems =
      !actionItemsPart || actionItemsPart.trim().toLowerCase() === "none"
        ? []
        : actionItemsPart
            .trim()
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
              const [itemText, owner] = line.split("|").map((s) => s.trim());
              return {
                text: itemText.replace(/^[-*]\s*/, ""),
                owner: owner && owner.toLowerCase() !== "none" ? owner : null,
              };
            });

    return { summary, actionItems };
  });
}

export async function generateTranscript(description: string, durationMinutes: number) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const totalSeconds = durationMinutes * 60;

    const prompt = `Write a realistic meeting transcript for: ${description}

This meeting lasts ${durationMinutes} minutes (${totalSeconds} seconds) total. Timestamps MUST be spread realistically across the FULL duration — the first line should be near [00:00] and the last line should be near [${Math.floor(durationMinutes)}:${String(totalSeconds % 60).padStart(2, "0")}]. Do not compress everything into the first minute.

Format each line exactly like this, one per line, nothing else:
[MM:SS] SpeakerName: what they said

Rules:
- The [MM:SS] timestamp appears ONLY ONCE at the very start of the line. Never repeat or restate the timestamp anywhere inside the spoken text itself.
- If a sentence is interrupted, end that line with an em dash (—) instead of a period, and have the next line (a different speaker) start immediately, even at the same or nearly the same timestamp.
- Use natural, real spoken conversation — filler words, trailing off, short reactive replies, genuine interruption.
- NEVER put more than one [MM:SS] timestamp on a single line. If two people speak at nearly the same time, write them as two separate consecutive lines, each with exactly one timestamp of its own — never combine two timestamps into one line.

Do not add any preamble, headers, markdown, or explanation. Start directly with the first line and end with the last line of dialogue.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  });
}

export async function askFathomQuestion(
  transcript: string,
  question: string,
  summary?: string
) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `You are Fathom AI, an intelligent meeting assistant. Answer the user's question accurately, concisely, and directly based on this meeting's context, summary, and transcript.

Meeting Summary (if available):
${summary || "None"}

Full Meeting Transcript:
${transcript}

User Question:
${question}

Provide a direct, helpful answer in clean markdown format (using bullet points and bold highlights when relevant).`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  });
}