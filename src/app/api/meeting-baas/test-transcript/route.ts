import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transcriptionUrl } = await request.json();

    if (!transcriptionUrl) {
      return NextResponse.json(
        { error: "transcriptionUrl is required" },
        { status: 400 }
      );
    }

    const response = await fetch(transcriptionUrl);

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error: "Failed to fetch transcription",
          status: response.status,
          details: text,
        },
        { status: 500 }
      );
    }

    const transcript = await response.json();

    console.log("=== MEETING BAAS TRANSCRIPT ===");
    console.log(JSON.stringify(transcript, null, 2));

    return NextResponse.json(transcript);
  } catch (error) {
    console.error("Transcript test error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}