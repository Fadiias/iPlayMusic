import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCategories, getFeaturedPlaylists, SpotifyAuthError, SpotifyApiError } from "../../lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const [featuredRes, categoriesRes] = await Promise.all([
      getFeaturedPlaylists(accessToken, 10, "US"),
      getCategories(accessToken, 20, "US"),
    ]);

    const playlists = featuredRes?.playlists?.items ?? [];
    const categories = categoriesRes?.categories?.items ?? [];

    const trends = playlists.slice(0, 2).map((p, i) => ({
      id: p?.id ?? `pl-${i}`,
      title: p?.name ?? "Playlist",
      hashtags: `${p?.tracks?.total ?? "?"} tracks`,
      image: p?.images?.[0]?.url ?? p?.images?.[1]?.url ?? p?.images?.[2]?.url ?? "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      engagement: "From Spotify",
      avatars: p?.owner?.images?.slice(0, 3).map((img) => img?.url).filter(Boolean) ?? [],
    }));

    const trendingNow = categories.slice(0, 4).map((c) => ({
      id: c?.id ?? c?.name,
      title: c?.name ?? "Genre",
      image: c?.icons?.[0]?.url ?? "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&q=80",
    }));

    return NextResponse.json({ ok: true, trends, trendingNow });
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
