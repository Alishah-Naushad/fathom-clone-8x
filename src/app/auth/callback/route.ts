import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();

    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const session = data.session;
      const user = session.user;

      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;

      if (providerToken) {
        const admin = createAdminClient();

        const expiresAt = session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null;

        const { error: tokenError } = await admin
          .from("google_connections")
          .upsert(
            {
              user_id: user.id,
              access_token: providerToken,
              ...(providerRefreshToken
                ? { refresh_token: providerRefreshToken }
                : {}),
              expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            }
          );

        if (tokenError) {
          console.error("Failed to save Google connection:", tokenError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}