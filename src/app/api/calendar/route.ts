import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
};

async function refreshGoogleAccessToken(
  refreshToken: string,
  userId: string
) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Google access token refresh failed");
  }

  const data = await response.json();

  const admin = createAdminClient();

  await admin
    .from("google_connections")
    .update({
      access_token: data.access_token,
      ...(data.refresh_token
        ? { refresh_token: data.refresh_token }
        : {}),
      expires_at: new Date(
        Date.now() + data.expires_in * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return data.access_token as string;
}

export async function GET() {
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

  const admin = createAdminClient();

  const { data: connection, error: connectionError } = await admin
    .from("google_connections")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", user.id)
    .single();

  if (connectionError || !connection) {
    return NextResponse.json(
      {
        error:
          "Google Calendar is not connected. Please sign in again.",
      },
      { status: 400 }
    );
  }

  let accessToken = connection.access_token;

  const expiresAt = connection.expires_at
    ? new Date(connection.expires_at).getTime()
    : 0;

  // Refresh if the token expires within the next 60 seconds.
  if (
    connection.refresh_token &&
    expiresAt <= Date.now() + 60_000
  ) {
    accessToken = await refreshGoogleAccessToken(
      connection.refresh_token,
      user.id
    );
  }

  const timeMin = new Date().toISOString();

  const calendarUrl = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  );

  calendarUrl.searchParams.set("timeMin", timeMin);
  calendarUrl.searchParams.set("singleEvents", "true");
  calendarUrl.searchParams.set("orderBy", "startTime");
  calendarUrl.searchParams.set("maxResults", "25");

  const googleResponse = await fetch(calendarUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (googleResponse.status === 401 && connection.refresh_token) {
    accessToken = await refreshGoogleAccessToken(
      connection.refresh_token,
      user.id
    );

    const retryResponse = await fetch(calendarUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!retryResponse.ok) {
    const retryErrorText = await retryResponse.text();

    console.error("Google Calendar retry error:", {
      status: retryResponse.status,
      body: retryErrorText,
    });

    return NextResponse.json(
      {
        error: "Google Calendar retry failed",
        googleStatus: retryResponse.status,
        googleError: retryErrorText,
      },
      { status: 502 }
    );
  }

    const retryData = await retryResponse.json();

    return NextResponse.json({
      events: formatCalendarEvents(retryData.items ?? []),
    });
  }

  if (!googleResponse.ok) {
  const errorText = await googleResponse.text();

  console.error("Google Calendar API error:", {
    status: googleResponse.status,
    body: errorText,
  });

  return NextResponse.json(
    {
      error: "Google Calendar API request failed",
      googleStatus: googleResponse.status,
      googleError: errorText,
    },
    { status: 502 }
  );
}

  const data = await googleResponse.json();

  return NextResponse.json({
    events: formatCalendarEvents(data.items ?? []),
  });
}

function formatCalendarEvents(events: GoogleCalendarEvent[]) {
  return events
    .filter((event) => {
      const hasMeetLink =
        Boolean(event.hangoutLink) ||
        Boolean(
          event.conferenceData?.entryPoints?.some(
            (entry) =>
              entry.entryPointType === "video" &&
              entry.uri
          )
        );

      return hasMeetLink;
    })
    .map((event) => {
      const meetLink =
        event.hangoutLink ||
        event.conferenceData?.entryPoints?.find(
          (entry) =>
            entry.entryPointType === "video" && entry.uri
        )?.uri ||
        null;

      return {
        id: event.id,
        title: event.summary || "Untitled meeting",
        description: event.description || "",
        start: event.start?.dateTime || event.start?.date || null,
        end: event.end?.dateTime || event.end?.date || null,
        meetLink,
        calendarLink: event.htmlLink || null,
        attendees: event.attendees || [],
      };
    });
}