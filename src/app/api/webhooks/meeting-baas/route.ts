import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("=== Meeting BaaS Webhook ===");
    console.log(JSON.stringify(payload, null, 2));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Meeting BaaS webhook error:", error);

    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}