import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { skipToPrevious, SpotifyAuthError, SpotifyApiError } from "@/app/lib/spotify";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    await skipToPrevious(accessToken, body?.deviceId);
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
