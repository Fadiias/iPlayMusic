import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getUserProfile,
  getFeaturedPlaylists,
  getNewReleases,
  getCategories,
  getCategoryPlaylists,
  getPlaylists,
  SpotifyAuthError,
  SpotifyApiError,
} from "../../../lib/spotify";

export const dynamic = "force-dynamic";

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const profile = await getUserProfile(accessToken).catch(() => ({}));
    const country = profile?.country || "US";

    const [featuredRes, newReleasesRes, categoriesRes, userPlaylistsRes] = await Promise.all([
      getFeaturedPlaylists(accessToken, 10, country).catch(() => ({ playlists: { items: [] } })),
      getNewReleases(accessToken, 20, country).catch(() => ({ albums: { items: [] } })),
      getCategories(accessToken, 20, country).catch(() => ({ categories: { items: [] } })),
      getPlaylists(accessToken, 20).catch(() => ({ items: [] })),
    ]);

    const featured = (featuredRes?.playlists?.items ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image: p.images?.[0]?.url ?? p.images?.[1]?.url ?? PLACEHOLDER,
      trackCount: p.tracks?.total ?? 0,
    }));
    const newReleases = (newReleasesRes?.albums?.items ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      artist: a.artists?.[0]?.name ?? "",
      image: a.images?.[0]?.url ?? a.images?.[1]?.url ?? PLACEHOLDER,
    }));
    const categories = (categoriesRes?.categories?.items ?? []).slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      image: c.icons?.[0]?.url ?? PLACEHOLDER,
    }));
    const playlists = (userPlaylistsRes?.items ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url ?? p.images?.[1]?.url ?? PLACEHOLDER,
      trackCount: p.tracks?.total ?? 0,
    }));

    return NextResponse.json({
      ok: true,
      featured: featured.slice(0, 6),
      newReleases: newReleases.slice(0, 12),
      categories: categories.slice(0, 8),
      playlists: playlists.slice(0, 6),
    });
  } catch (e) {
    if (e instanceof SpotifyAuthError) return NextResponse.json({ ok: false }, { status: 401 });
    if (e instanceof SpotifyApiError) return NextResponse.json({ ok: false }, { status: e.status || 500 });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
