import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlaylistDashboard from "./components/pages/PlaylistDashboard";
import { getRecentlyPlayed, getTopTracks, SpotifyAuthError } from "./lib/spotify";

export const dynamic = "force-dynamic";

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.floor((Number(durationMs) || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken) {
    redirect("/welcome");
  }

  try {
    let items = [];
    const seenIds = new Set();

    for (const timeRange of ["short_term", "medium_term", "long_term"]) {
      if (items.length >= 10) break;
      try {
        const top = await getTopTracks(accessToken, 20, timeRange);
        const topItems = Array.isArray(top?.items) ? top.items : [];
        for (const t of topItems) {
          const id = typeof t?.id === "string" ? t.id : "";
          if (!id || seenIds.has(id)) continue;
          seenIds.add(id);
          items.push(t);
          if (items.length >= 10) break;
        }
      } catch {
        continue;
      }
    }

    if (items.length < 10) {
      const recent = await getRecentlyPlayed(accessToken, 50);
      for (const it of recent?.items || []) {
        const t = it?.track;
        const id = typeof t?.id === "string" ? t.id : "";
        if (!id || seenIds.has(id)) continue;
        seenIds.add(id);
        items.push(t);
        if (items.length >= 10) break;
      }
    }

    const uiTracks = items.slice(0, 10).map((track) => ({
      id: typeof track?.id === "string" ? track.id : "",
      uri: typeof track?.uri === "string" ? track.uri : "",
      previewUrl: typeof track?.preview_url === "string" ? track.preview_url : "",
      durationMs: Number.isFinite(Number(track?.duration_ms)) ? Number(track.duration_ms) : 0,
      title: firstNonEmpty(track?.name, "Unknown"),
      artist:
        Array.isArray(track?.artists) && track.artists.length
          ? track.artists.map((a) => a?.name).filter(Boolean).join(", ")
          : "Unknown artist",
      duration: formatDuration(track?.duration_ms),
      albumArt:
        track?.album?.images?.[0]?.url ||
        track?.album?.images?.[1]?.url ||
        track?.album?.images?.[2]?.url ||
        "",
    }));

    const coverCenter = uiTracks[0]?.albumArt || "/Path 343.png";
    const coverLeft = uiTracks[1]?.albumArt || "/Group 434.png";
    const coverRight = uiTracks[2]?.albumArt || "/badges.png";

    return (
      <PlaylistDashboard
        tracks={uiTracks}
        featuredTitle="Your Top Tracks"
        featuredSubtitle="from Spotify"
        coverLeft={coverLeft}
        coverCenter={coverCenter}
        coverRight={coverRight}
      />
    );
  } catch (error) {
    // If token expired and we have a refresh token, refresh then come back.
    if (error instanceof SpotifyAuthError && error.status === 401 && refreshToken) {
      redirect("/api/auth/refresh?next=/");
    }

    // Otherwise send user to login.
    redirect("/login");
  }
}

