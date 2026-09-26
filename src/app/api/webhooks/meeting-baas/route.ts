import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const LIVE_STATUSES = new Set([
  "sent",
  "joining_call",
  "in_waiting_room",
  "in_call_not_recording",
  "in_call_recording",
  "call_ended",
  "left_call",
  "transcribing",
  "transcription_in_progress",
  "processing",
]);

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("=== Meeting BaaS Webhook ===");
    console.log(JSON.stringify(payload, null, 2));

    const botId = payload?.data?.bot_id;
    const event = payload?.event;

    if (!botId) {
      console.warn("Webhook received without bot_id");
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();

    /*
     * Meeting BaaS sends bot.status_change events while
     * the bot progresses through the meeting lifecycle.
     */
    if (event === "bot.status_change") {
      const status = payload?.data?.status?.code;

      if (!status) {
        console.warn("Status change webhook missing status code");
        return NextResponse.json({ received: true });
      }

      // Fetch current row first so we only stamp recording_started_at once
      const { data: existingBot } = await admin
        .from("meeting_bots")
        .select("recording_started_at")
        .eq("bot_id", botId)
        .single();

      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "in_call_recording" && !existingBot?.recording_started_at) {
        updates.recording_started_at = new Date().toISOString();
      }

      const { error } = await admin
        .from("meeting_bots")
        .update(updates)
        .eq("bot_id", botId);

      if (error) {
        console.error("Failed to update meeting bot status:", error);

        return NextResponse.json(
          { error: "Failed to update bot status" },
          { status: 500 }
        );
      }

      console.log(
        `Meeting BaaS bot ${botId} status updated to: ${status}`
      );

      return NextResponse.json({
        received: true,
        botId,
        status,
        live: LIVE_STATUSES.has(status),
      });
    }

    /*
     * bot.completed — Meeting BaaS has finished processing the recording,
     * transcription, and diarization. This is where we:
     *   1. Look up which user owns this bot
     *   2. Fetch the real transcript
     *   3. Create a real `meetings` row with real audio + real participants
     *   4. Insert real transcript lines
     *   5. Migrate any live notes taken during the call into real highlights
     *   6. Link the bot record to the new meeting
     *
     * Summary and action items are intentionally NOT generated here —
     * they're lazily generated the first time the user opens this meeting
     * from "My Meetings", to keep this webhook fast and avoid spending
     * Gemini quota on meetings that might never be viewed.
     */
    if (event === "bot.completed") {
      const botData = payload?.data;

      // 1. Look up which user owns this bot
      const { data: botRow, error: botLookupError } = await admin
        .from("meeting_bots")
        .select("*")
        .eq("bot_id", botId)
        .single();

      if (botLookupError || !botRow) {
        console.error("Bot completed but no mapping found:", botLookupError);
        return NextResponse.json({ error: "Unknown bot" }, { status: 404 });
      }

      // 2. Fetch the real transcript
      const transcriptionUrl = botData?.transcription;

      if (!transcriptionUrl) {
        console.error("bot.completed webhook missing transcription URL:", payload);
        await admin
          .from("meeting_bots")
          .update({ status: "completed_no_transcript", updated_at: new Date().toISOString() })
          .eq("bot_id", botId);
        return NextResponse.json({ error: "Missing transcription URL" }, { status: 400 });
      }

            const transcriptRes = await fetch(transcriptionUrl);

      if (!transcriptRes.ok) {
        console.error(
          "Transcript fetch failed:",
          transcriptRes.status,
          await transcriptRes.text()
        );
      }

      const transcriptData = await transcriptRes.json();

      console.log(
        "Raw transcription payload:",
        JSON.stringify(transcriptData).slice(0, 2000)
      );

      const utterances = transcriptData?.result?.utterances ?? [];

      if (utterances.length === 0) {
        console.error("Transcript fetch returned 0 utterances");
        await admin
          .from("meeting_bots")
          .update({ status: "completed_empty", updated_at: new Date().toISOString() })
          .eq("bot_id", botId);
        return NextResponse.json({ received: true, warning: "empty transcript" });
      }

      // 3. Real participants — exclude the bot itself from the human attendee list
      const humanParticipants: string[] = (botData?.participants ?? [])
        .map((p: { name: string }) => p.name)
        .filter((name: string) => !name.toLowerCase().includes("notetaker"));

      // Accurately compute duration in seconds across all possible payload fields and transcript timestamps
      const maxUtteranceEnd = utterances.reduce(
        (max: number, u: { start?: number; end?: number }) =>
          Math.max(max, u.end || u.start || 0),
        0
      );

      const rawDurationSeconds = Number(
        botData?.duration_seconds ||
          botData?.duration ||
          botData?.recording_duration ||
          botData?.mp4_duration ||
          transcriptData?.result?.metadata?.audio_duration ||
          transcriptData?.result?.metadata?.total_speech_duration ||
          maxUtteranceEnd ||
          0
      );

      const durationMinutes = Math.max(
        1,
        Math.round(rawDurationSeconds / 60) || Math.ceil(maxUtteranceEnd / 60) || 1
      );

      // 4. Create the real meeting row with real audio
      const { data: meetingRow, error: meetingErr } = await admin
        .from("meetings")
        .insert({
          title: botRow.title || "Untitled Meeting",
          meeting_date: botData?.joined_at ?? new Date().toISOString(),
          duration_minutes: durationMinutes,
          participant_count: humanParticipants.length,
          participants: humanParticipants,
          meeting_type: "enhanced",
          user_id: botRow.user_id,
          thumbnail_url: null,
          audio_url: botData?.audio ?? null,
        })
        .select()
        .single();

      if (meetingErr || !meetingRow) {
        console.error("Failed to create meeting from bot transcript:", meetingErr);
        return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
      }

      // 5. Insert transcript lines
      const lines = utterances.map(
        (u: { speaker?: string; start: number; text: string }, i: number) => ({
          meeting_id: meetingRow.id,
          speaker: u.speaker || "Unknown",
          timestamp_seconds: Math.round(u.start),
          text: u.text,
          line_order: i,
        })
      );

      const { error: linesErr } = await admin.from("transcript_lines").insert(lines);
      if (linesErr) console.error("Failed to insert transcript lines:", linesErr);

      // 5.5. Migrate any live notes taken during the call into real highlights,
      // matched to the nearest transcript line by elapsed time.
      const liveNotes: { text: string; elapsed_seconds: number }[] = botRow.live_notes ?? [];

      if (liveNotes.length > 0 && lines.length > 0) {
        const { data: insertedLines } = await admin
          .from("transcript_lines")
          .select("id, line_order")
          .eq("meeting_id", meetingRow.id);

        if (insertedLines && insertedLines.length > 0) {
          const highlightRows = liveNotes
            .map((n) => {
              // Find the closest matching original line by elapsed_seconds
              let closest = lines[0];
              let closestDiff = Math.abs(lines[0].timestamp_seconds - n.elapsed_seconds);
              for (const line of lines) {
                const diff = Math.abs(line.timestamp_seconds - n.elapsed_seconds);
                if (diff < closestDiff) {
                  closest = line;
                  closestDiff = diff;
                }
              }

              const matchedLine = insertedLines.find((l) => l.line_order === closest.line_order);
              if (!matchedLine) return null;

              return {
                meeting_id: meetingRow.id,
                transcript_line_id: matchedLine.id,
                note: n.text,
              };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null);

          if (highlightRows.length > 0) {
            const { error: highlightErr } = await admin.from("highlights").insert(highlightRows);
            if (highlightErr) console.error("Failed to migrate live notes to highlights:", highlightErr);
            else console.log(`Migrated ${highlightRows.length} live note(s) into highlights`);
          }
        }
      }

      // 6. Link the bot record to the new meeting and mark completed
      await admin
        .from("meeting_bots")
        .update({
          status: "completed",
          meeting_id: meetingRow.id,
          updated_at: new Date().toISOString(),
        })
        .eq("bot_id", botId);

      console.log(`Meeting BaaS bot ${botId} → created meeting ${meetingRow.id}`);

      return NextResponse.json({
        received: true,
        botId,
        meetingId: meetingRow.id,
      });
    }

    console.log(`Unhandled Meeting BaaS event: ${event}`);

    return NextResponse.json({
      received: true,
      handled: false,
      event,
    });
  } catch (error) {
    console.error("Meeting BaaS webhook error:", error);

    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}