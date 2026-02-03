import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFeaturedPlaylists, getNewReleases, SpotifyAuthError, SpotifyApiError } from "../../lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const [featuredRes, newReleasesRes] = await Promise.all([
      getFeaturedPlaylists(accessToken, 10, "US"),
      getNewReleases(accessToken, 10, "US"),
    ]);

    const playlists = featuredRes?.playlists?.items ?? [];
    const albums = newReleasesRes?.albums?.items ?? [];

    const events = [
      ...playlists.slice(0, 2).map((p, i) => ({
        id: `pl-${p?.id ?? i}`,
        image: p?.images?.[0]?.url ?? p?.images?.[1]?.url ?? "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        hashtags: "#spotify #featured",
        engagement: "Featured on Spotify",
        title: p?.name ?? "Featured Playlist",
        avatars: p?.owner?.images?.slice(0, 3).map((img) => img?.url).filter(Boolean) ?? [],
      })),
      ...albums.slice(0, 4).map((a, i) => ({
        id: `al-${a?.id ?? i}`,
        image: a?.images?.[0]?.url ?? a?.images?.[1]?.url ?? "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        hashtags: a?.artists?.map((ar) => `#${(ar?.name ?? "").replace(/\s+/g, "")}`).filter(Boolean).join(" ") || "#newrelease",
        engagement: "New Release",
        title: a?.name ?? "New Album",
        avatars: a?.artists?.map((ar) => ar?.name).filter(Boolean) ?? [],
      })),
    ];

    const hashtags = [...new Set([
      "#spotify",
      "#musicworld",
      "#newreleases",
      "#featured",
      ...albums.slice(0, 3).flatMap((a) => a?.artists?.map((ar) => `#${ar?.name?.replace(/\s+/g, "").toLowerCase()}`).filter(Boolean) ?? []),
    ])].slice(0, 8);

    return NextResponse.json({ ok: true, events, hashtags });
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
