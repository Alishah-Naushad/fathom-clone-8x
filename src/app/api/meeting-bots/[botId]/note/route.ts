import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const { note } = await request.json();

  if (!note?.trim()) {
    return NextResponse.json({ error: "Note text is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: botRow, error: fetchErr } = await admin
    .from("meeting_bots")
    .select("*")
    .eq("bot_id", botId)
    .eq("user_id", user.id) // ownership check
    .single();

  if (fetchErr || !botRow) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  const elapsedSeconds = botRow.recording_started_at
    ? Math.max(0, Math.floor((Date.now() - new Date(botRow.recording_started_at).getTime()) / 1000))
    : 0;

  const newNote = {
    text: note.trim(),
    elapsed_seconds: elapsedSeconds,
    created_at: new Date().toISOString(),
  };

  const updatedNotes = [...(botRow.live_notes ?? []), newNote];

  const { error: updateErr } = await admin
    .from("meeting_bots")
    .update({ live_notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq("bot_id", botId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, note: newNote });
}