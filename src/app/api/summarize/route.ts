import { generateSummary } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { transcript, template } = await req.json();
        const parsed = await generateSummary(transcript, template);
        return Response.json(parsed);
    } catch (err) {
        console.error("Summarize route error:", err);
        return Response.json({ error: "Summarization failed" }, { status: 500 });
    }
}