import { cookies } from "next/headers";
import { getUserProfile, getFeaturedPlaylists, getNewReleases, getPlaylists, search } from "../lib/spotify";
import EventsFeedClient from "./EventsFeedClient";

export const dynamic = "force-dynamic";

const PLACEHOLDER = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80";

async function getEventsData(accessToken) {
  try {
    const profile = await getUserProfile(accessToken).catch(() => ({}));
    const country = profile?.country || "US";

    const [featuredRes, newReleasesRes, userPlaylistsRes] = await Promise.all([
      getFeaturedPlaylists(accessToken, 10, country).catch(() => ({ playlists: { items: [] } })),
      getNewReleases(accessToken, 10, country).catch(() => ({ albums: { items: [] } })),
      getPlaylists(accessToken, 10).catch(() => ({ items: [] })),
    ]);
    let playlists = featuredRes?.playlists?.items ?? [];
    let albums = newReleasesRes?.albums?.items ?? [];
    const userPl = userPlaylistsRes?.items ?? [];

    if (playlists.length === 0 && albums.length === 0 && userPl.length === 0) {
      const [searchPlaylists, searchAlbums] = await Promise.all([
        search(accessToken, "top hits", ["playlist"], 10).then((r) => r?.playlists?.items ?? []).catch(() => []),
        search(accessToken, "pop", ["album"], 10).then((r) => r?.albums?.items ?? []).catch(() => []),
      ]);
      playlists = searchPlaylists;
      albums = searchAlbums;
    }

    const toEvent = (item, prefix, type) => ({
      id: `${prefix}-${item?.id ?? Math.random()}`,
      image: item?.images?.[0]?.url ?? item?.images?.[1]?.url ?? PLACEHOLDER,
      hashtags: type === "album" ? (item?.artists?.map((ar) => `#${(ar?.name ?? "").replace(/\s+/g, "")}`).filter(Boolean).join(" ") || "#newrelease") : "#spotify #featured",
      engagement: type === "album" ? "New Release" : "Featured on Spotify",
      title: item?.name ?? "Content",
      avatars: type === "album" ? (item?.artists?.map((ar) => ar?.name).filter(Boolean) ?? []) : (item?.owner?.images?.slice(0, 3).map((img) => img?.url).filter(Boolean) ?? []),
    });

    let events = [
      ...playlists.slice(0, 2).map((p, i) => toEvent(p, "pl", "playlist")),
      ...albums.slice(0, 4).map((a, i) => toEvent(a, "al", "album")),
    ];
    if (events.length === 0 && userPl.length > 0) {
      events = userPl.slice(0, 6).map((p, i) => toEvent(p, "upl", "playlist"));
    }

    const hashtags = [...new Set(["#spotify", "#musicworld", "#newreleases", "#featured", ...albums.slice(0, 3).flatMap((a) => a?.artists?.map((ar) => `#${(ar?.name ?? "").replace(/\s+/g, "").toLowerCase()}`).filter(Boolean) ?? []), ...userPl.slice(0, 2).flatMap((p) => p?.name ? [`#${p.name.replace(/\s+/g, "").toLowerCase().slice(0, 15)}`] : [])])].slice(0, 8);

    return { events, hashtags };
  } catch {
    return { events: [], hashtags: ["#spotify", "#musicworld", "#newreleases", "#featured"] };
  }
}

export default async function EventsFeedPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return <EventsFeedClient events={[]} hashtags={["#spotify", "#musicworld", "#newreleases", "#featured"]} needsAuth />;
  }

  const { events, hashtags } = await getEventsData(accessToken);
  return <EventsFeedClient events={events} hashtags={hashtags} />;
}
