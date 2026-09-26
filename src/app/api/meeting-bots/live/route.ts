import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const LIVE_STATUSES = [
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
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("meeting_bots")
    .select("*")
    .eq("user_id", user.id)
    .in("status", LIVE_STATUSES)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bots: data ?? [] });
}