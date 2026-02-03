import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTrack, SpotifyAuthError, SpotifyApiError } from "@/app/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(_, { params }) {
  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const track = await getTrack(accessToken, id);
    const previewUrl = track?.preview_url || null;
    return NextResponse.json({
      ok: true,
      previewUrl,
      name: track?.name,
      artists: track?.artists,
      duration_ms: track?.duration_ms,
    });
  } catch (e) {
    if (e instanceof SpotifyAuthError) return NextResponse.json({ ok: false }, { status: 401 });
    if (e instanceof SpotifyApiError) return NextResponse.json({ ok: false }, { status: e.status || 500 });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
