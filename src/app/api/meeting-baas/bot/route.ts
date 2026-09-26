import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { meetingUrl, title, calendarEventId } = await request.json();

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

    // Get the currently signed-in user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create the Meeting BaaS bot
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

    const botId = data?.bot_id;

    if (!botId) {
      console.error("Meeting BaaS response missing bot_id:", data);

      return NextResponse.json(
        { error: "Meeting BaaS response missing bot_id" },
        { status: 500 }
      );
    }

    // Store the relationship between the bot and signed-in user
    const admin = createAdminClient();

    const { error: mappingError } = await admin
      .from("meeting_bots")
      .insert({
        user_id: user.id,
        bot_id: botId,
        meeting_url: meetingUrl,
        calendar_event_id: calendarEventId ?? null,
        title: title ?? null,
        status: "sent",
      });

    if (mappingError) {
      console.error("Failed to save bot mapping:", mappingError);

      return NextResponse.json(
        {
          error: "Bot was created but failed to save ownership mapping",
          details: mappingError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...data,
      mappingSaved: true,
    });
  } catch (error) {
    console.error("Failed to send Meeting BaaS bot:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}