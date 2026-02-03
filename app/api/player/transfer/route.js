import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { transferPlayback, SpotifyAuthError, SpotifyApiError } from "@/app/lib/spotify";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const deviceId = typeof payload?.deviceId === "string" ? payload.deviceId : undefined;
  if (!deviceId) {
    return NextResponse.json({ ok: false, error: "MISSING_DEVICE_ID" }, { status: 400 });
  }

  try {
    await transferPlayback(accessToken, deviceId, false);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      return NextResponse.json({ ok: false, error: "SPOTIFY_AUTH_ERROR" }, { status: 401 });
    }
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ ok: false, error: "SPOTIFY_API_ERROR" }, { status: error.status || 500 });
    }
    return NextResponse.json({ ok: false, error: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
