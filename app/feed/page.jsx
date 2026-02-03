import { cookies } from "next/headers";
import { getUserProfile, getCategories, getFeaturedPlaylists, getNewReleases, getCategoryPlaylists, getPlaylists, search } from "../lib/spotify";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80";

function mapToTrend(item, i, type = "playlist") {
  const img = item?.images?.[0]?.url ?? item?.images?.[1]?.url ?? item?.images?.[2]?.url ?? PLACEHOLDER_IMG;
  const title = item?.name ?? "Trending";
  const avatars = type === "playlist" && item?.owner?.images
    ? item.owner.images.slice(0, 3).map((im) => im?.url).filter(Boolean)
    : [];
  return {
    id: item?.id ?? `t-${i}`,
    title,
    hashtags: type === "album" ? `${item?.artists?.[0]?.name ?? "Artist"}` : `${item?.tracks?.total ?? "?"} tracks`,
    image: img,
    engagement: type === "album" ? "New Release" : "From Spotify",
    avatars,
  };
}

async function getTrendsData(accessToken) {
  try {
    const profile = await getUserProfile(accessToken).catch(() => ({}));
    const country = profile?.country || "US";

    const [featuredRes, categoriesRes, newReleasesRes, userPlaylistsRes] = await Promise.all([
      getFeaturedPlaylists(accessToken, 10, country).catch(() => ({ playlists: { items: [] } })),
      getCategories(accessToken, 20, country).catch(() => ({ categories: { items: [] } })),
      getNewReleases(accessToken, 12, country).catch(() => ({ albums: { items: [] } })),
      getPlaylists(accessToken, 15).catch(() => ({ items: [] })),
    ]);
    const playlists = featuredRes?.playlists?.items ?? [];
    const categories = categoriesRes?.categories?.items ?? [];
    const albums = newReleasesRes?.albums?.items ?? [];
    const userPl = userPlaylistsRes?.items ?? [];

    let trends = playlists.slice(0, 2).map((p, i) => mapToTrend(p, i, "playlist"));
    if (trends.length === 0 && albums.length > 0) {
      trends = albums.slice(0, 2).map((a, i) => mapToTrend(a, i, "album"));
    }
    if (trends.length === 0 && categories.length > 0) {
      try {
        const cat = categories[0];
        const catPl = await getCategoryPlaylists(accessToken, cat.id, 10, country);
        const items = catPl?.playlists?.items ?? [];
        trends = items.slice(0, 2).map((p, i) => mapToTrend(p, i, "playlist"));
      } catch {
        // keep trends empty
      }
    }
    if (trends.length === 0 && userPl.length > 0) {
      trends = userPl.slice(0, 2).map((p, i) => mapToTrend(p, i, "playlist"));
    }
    if (trends.length === 0) {
      const searchRes = await search(accessToken, "top hits", ["playlist"], 10).catch(() => ({}));
      const searchPl = searchRes?.playlists?.items ?? [];
      trends = searchPl.slice(0, 2).map((p, i) => mapToTrend(p, i, "playlist"));
    }

    let trendingNow = categories.slice(0, 4).map((c) => ({
      id: c?.id ?? c?.name,
      title: c?.name ?? "Genre",
      image: c?.icons?.[0]?.url ?? "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&q=80",
    }));
    if (trendingNow.length === 0 && albums.length > 0) {
      trendingNow = albums.slice(0, 4).map((a) => ({
        id: a?.id ?? a?.name,
        title: a?.name ?? "New",
        image: a?.images?.[0]?.url ?? a?.images?.[1]?.url ?? "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&q=80",
      }));
    }
    if (trendingNow.length === 0 && userPl.length > 0) {
      trendingNow = userPl.slice(0, 4).map((p) => ({
        id: p?.id ?? p?.name,
        title: p?.name ?? "Playlist",
        image: p?.images?.[0]?.url ?? p?.images?.[1]?.url ?? "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&q=80",
      }));
    }
    if (trendingNow.length === 0) {
      const searchRes = await search(accessToken, "pop", ["album", "playlist"], 8).catch(() => ({}));
      const searchAlbums = searchRes?.albums?.items ?? [];
      const searchPl = searchRes?.playlists?.items ?? [];
      const combined = [...searchAlbums, ...searchPl].slice(0, 4);
      trendingNow = combined.map((item) => ({
        id: item?.id ?? item?.name,
        title: item?.name ?? "Trending",
        image: item?.images?.[0]?.url ?? item?.images?.[1]?.url ?? "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&q=80",
      }));
    }
    return { trends, trendingNow };
  } catch {
    return { trends: [], trendingNow: [] };
  }
}

export default async function FeedPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return <FeedClient trends={[]} trendingNow={[]} needsAuth />;
  }

  const { trends, trendingNow } = await getTrendsData(accessToken);
  return <FeedClient trends={trends} trendingNow={trendingNow} />;
}
