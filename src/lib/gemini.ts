import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TEMPLATE_PROMPTS: Record<string, string> = {
  enhanced:
    "Summarize this meeting transcript into: a short TL;DR (2-3 sentences), key discussion points as bullets, and any decisions made.",
  sales:
    "Summarize this sales call into: prospect's stated pain points, objections raised, budget/timeline signals if mentioned, and next steps.",
  standup:
    "Summarize this standup into three sections: what was completed, what's planned next, and any blockers raised, grouped by person.",
  one_on_one:
    "Summarize this 1:1 into: main topics discussed, any feedback given (both directions), and career/growth notes if mentioned.",
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${TEMPLATE_PROMPTS[template] ?? TEMPLATE_PROMPTS.enhanced}

Also extract clear action items as a separate list, each with "text" and "owner" (use null for owner if not identifiable).

Return ONLY valid JSON in exactly this shape, no markdown code fences, no preamble:
{"summary": "...", "actionItems": [{"text": "...", "owner": "..." }]}

Transcript:
${transcript}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  });
}

export async function generateTranscript(description: string) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a realistic meeting transcript for: ${description}

Format each line exactly like this, one per line, nothing else:
[MM:SS] SpeakerName: what they said

Make it sound like real spoken conversation — natural pauses, some back-and-forth, occasional short replies or interruptions. Do not add any preamble, headers, markdown, or explanation. Start directly with the first line and end with the last line of dialogue.`;

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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