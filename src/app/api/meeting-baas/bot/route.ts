import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { meetingUrl } = await request.json();

    if (!meetingUrl) {
      return NextResponse.json(
        { error: "meetingUrl is required" },
        { status: 400 }
      );
    }

    if (!process.env.MEETING_BAAS_API_KEY) {
      return NextResponse.json(
        { error: "MEETING_BAAS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.meetingbaas.com/v2/bots",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-meeting-baas-api-key":
            process.env.MEETING_BAAS_API_KEY,
        },
        body: JSON.stringify({
          meeting_url: meetingUrl,
          bot_name: "Fathom Clone Notetaker",
          recording_mode: "speaker_view",
          transcription_enabled: true,
          transcription_config: {
            provider: "gladia",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Meeting BaaS error:", data);

      return NextResponse.json(
        {
          error: "Meeting BaaS request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to send Meeting BaaS bot:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}