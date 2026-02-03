import { cookies } from "next/headers";
import { getUserProfile, getCategories, getCategoryPlaylists, getPlaylistTracks, search } from "../lib/spotify";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

const GENRES = [
  { id: "alternative", name: "Alternative", searchTerm: "alternative rock" },
  { id: "blues", name: "Blues", searchTerm: "blues" },
  { id: "classical", name: "Classical", searchTerm: "classical" },
  { id: "country", name: "Country", searchTerm: "country" },
  { id: "dance", name: "Dance", searchTerm: "dance" },
  { id: "electronic", name: "Electronic", searchTerm: "electronic" },
  { id: "fitness", name: "Fitness & Workout", searchTerm: "fitness workout" },
  { id: "hiphop", name: "Hip-Hop/Rap", searchTerm: "hip hop rap" },
  { id: "industrial", name: "Industrial", searchTerm: "industrial" },
];

const COLORS = ["#FF1168", "#FF6A00", "#FFD700", "#5EB11C", "#3A7634", "#0ABEBE", "#00A1CB", "#115793", "#6B2D5C"];

function toPlayTrack(t) {
  if (!t?.id) return null;
  const totalSec = Math.floor((t.duration_ms || 0) / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return {
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a) => a.name).join(", ") || "",
    albumArt: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || "",
    previewUrl: t.preview_url || "",
    durationMs: t.duration_ms || 0,
    duration: `${minutes}:${String(seconds).padStart(2, "0")}`,
  };
}

async function getPlaylistsForGenre(accessToken, genre, country) {
  try {
    const catRes = await getCategories(accessToken, 50, country);
    const spotifyCategories = catRes?.categories?.items ?? [];
    const spotifyCat = spotifyCategories.find(
      (c) => c.id?.toLowerCase().includes(genre.id) || c.name?.toLowerCase().includes(genre.id) || (genre.name?.toLowerCase() || "").includes((c.name?.toLowerCase() || "").split(" ")[0])
    );
    if (spotifyCat) {
      const plRes = await getCategoryPlaylists(accessToken, spotifyCat.id, 5, country);
      return plRes?.playlists?.items ?? [];
    }
  } catch {
    //
  }
  const searchRes = await search(accessToken, genre.searchTerm || genre.name, ["playlist"], 5).catch(() => ({}));
  return searchRes?.playlists?.items ?? [];
}

async function getCategoryTracks(accessToken, genre, country) {
  const playlists = await getPlaylistsForGenre(accessToken, genre, country);
  const allTracks = [];
  for (const pl of playlists.slice(0, 2)) {
    if (allTracks.length >= 5) break;
    try {
      const res = await getPlaylistTracks(accessToken, pl.id, 20, 0);
      const items = res?.items ?? [];
      for (const it of items) {
        const t = it?.track;
        if (t?.id && t.type === "track") {
          const pt = toPlayTrack(t);
          if (pt) allTracks.push(pt);
          if (allTracks.length >= 10) break;
        }
      }
    } catch {
      //
    }
  }
  return allTracks.slice(0, 10);
}

async function getCategoriesData(accessToken) {
  const profile = await getUserProfile(accessToken).catch(() => ({}));
  const country = profile?.country || "US";

  const result = [];
  for (let i = 0; i < GENRES.length; i++) {
    const genre = GENRES[i];
    const color = COLORS[i % COLORS.length];
    const tracks = await getCategoryTracks(accessToken, genre, country);
    result.push({
      id: genre.id,
      name: genre.name,
      color,
      tracks: tracks.slice(0, Math.max(5, tracks.length)),
    });
  }
  return result;
}

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return <CategoriesClient categories={[]} needsAuth />;
  }

  const categories = await getCategoriesData(accessToken);
  return <CategoriesClient categories={categories} needsAuth={false} />;
}
