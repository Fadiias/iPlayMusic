"use client";

import Link from "next/link";
import { usePlayback } from "../components/player/PlaybackContext";

export default function RecentlyPlayedClient({ items }) {
  const { playTrack, openExpanded } = usePlayback();

  const handlePlay = (e, item) => {
    e.preventDefault();
    const t = item.track;
    if (!t?.id) return;
    const track = {
      id: t.id,
      title: t.name,
      artist: t.artists?.map((a) => a.name).join(", ") || "",
      albumArt: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || "",
      previewUrl: t.preview_url || "",
      durationMs: t.duration_ms || 0,
    };
    const allTracks = (items || []).map((i) => {
      const x = i.track;
      return x ? {
        id: x.id,
        title: x.name,
        artist: x.artists?.map((a) => a.name).join(", ") || "",
        albumArt: x.album?.images?.[0]?.url || "",
        previewUrl: x.preview_url || "",
        durationMs: x.duration_ms || 0,
      } : null;
    }).filter(Boolean);
    playTrack(track, allTracks);
    openExpanded();
  };

  return (
    <div className="px-4 space-y-2">
      {items?.map((item, index) => (
        <div
          key={`${item.track?.id}-${index}`}
          onClick={(e) => handlePlay(e, item)}
          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
            <img
              src={item.track?.album?.images?.[0]?.url || "/placeholder.png"}
              alt={item.track?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-white truncate">{item.track?.name}</p>
            <p className="text-[12px] text-white/60 truncate">{item.track?.artists?.[0]?.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
