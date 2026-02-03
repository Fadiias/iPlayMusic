import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAlbum } from "../../lib/spotify";
import AlbumDetailsClient from "./AlbumDetailsClient";

export const dynamic = "force-dynamic";

export default async function AlbumDetailsPage({ params }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const albumId = params?.id;
  if (!albumId) {
    redirect("/");
  }

  let album = null;
  try {
    album = await getAlbum(accessToken, albumId);
  } catch (e) {
    console.error("Failed to fetch album:", e);
  }

  if (!album) {
    redirect("/");
  }

  const albumVm = {
    id: album.id,
    title: album.name,
    artist: album.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
    year: album.release_date ? String(album.release_date).slice(0, 4) : "",
    cover: album.images?.[0]?.url || null,
    tracks:
      album.tracks?.items?.map((t) => ({
        id: t.id,
        title: t.name,
        durationMs: t.duration_ms,
      })) || [],
  };

  return <AlbumDetailsClient album={albumVm} />;
}
