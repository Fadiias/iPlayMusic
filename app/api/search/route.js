import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { search, SpotifyAuthError, SpotifyApiError } from "../../lib/spotify";

export const dynamic = "force-dynamic";

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function toPlayTrack(t) {
  if (!t) return null;
  return {
    id: t.id ?? "",
    uri: t.uri ?? "",
    previewUrl: t.preview_url ?? "",
    durationMs: Number(t.duration_ms) || 0,
    title: t.name ?? "Unknown",
    artist: Array.isArray(t.artists) && t.artists.length
      ? t.artists.map((a) => a?.name).filter(Boolean).join(", ")
      : "Unknown artist",
    duration: formatDuration(t.duration_ms),
    albumArt: t.album?.images?.[0]?.url ?? t.album?.images?.[1]?.url ?? t.album?.images?.[2]?.url ?? "",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });

  if (!q || q.length < 2) {
    return NextResponse.json({
      ok: true,
      tracks: [],
      artists: [],
      albums: [],
      playlists: [],
    });
  }

  try {
    const res = await search(accessToken, q, ["track", "artist", "album", "playlist"], 20);
    const tracksRaw = res?.tracks?.items ?? [];
    const artists = (res?.artists?.items ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      image: a.images?.[0]?.url ?? a.images?.[1]?.url ?? "",
      genres: a.genres ?? [],
    }));
    const albums = (res?.albums?.items ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      artist: a.artists?.[0]?.name ?? "",
      image: a.images?.[0]?.url ?? a.images?.[1]?.url ?? "",
    }));
    const playlists = (res?.playlists?.items ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image: p.images?.[0]?.url ?? p.images?.[1]?.url ?? "",
      owner: p.owner?.display_name ?? "",
      trackCount: p.tracks?.total ?? 0,
    }));
    const tracks = tracksRaw.map(toPlayTrack).filter(Boolean);

    return NextResponse.json({
      ok: true,
      tracks,
      artists,
      albums,
      playlists,
    });
  } catch (e) {
    if (e instanceof SpotifyAuthError) return NextResponse.json({ ok: false }, { status: 401 });
    if (e instanceof SpotifyApiError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status || 500 });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
