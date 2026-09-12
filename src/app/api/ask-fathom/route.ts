import { NextResponse } from "next/server";
import { askFathomQuestion } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { transcript, question, summary } = await req.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: "Transcript and question are required." },
        { status: 400 }
      );
    }

    const answer = await askFathomQuestion(transcript, question, summary);
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Ask Fathom error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process question." },
      { status: 500 }
    );
  }
}
