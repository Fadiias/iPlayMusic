import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resumePlayback, SpotifyAuthError, SpotifyApiError } from "@/app/lib/spotify";

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

  try {
    await resumePlayback(accessToken, deviceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      return NextResponse.json({ ok: false, error: "SPOTIFY_AUTH_ERROR" }, { status: 401 });
    }
    if (error instanceof SpotifyApiError) {
      if (error.status === 404 || error.status === 502 || error.status === 503 || error.status === 500) {
        return NextResponse.json({ ok: false, error: "NO_ACTIVE_DEVICE" }, { status: 200 });
      }
      return NextResponse.json({ ok: false, error: "SPOTIFY_API_ERROR" }, { status: Math.min(error.status || 500, 599) });
    }
    return NextResponse.json({ ok: false, error: "UNKNOWN_ERROR" }, { status: 200 });
  }
}
