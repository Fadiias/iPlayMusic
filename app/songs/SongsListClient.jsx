"use client";

import { usePlayback } from "../components/player/PlaybackContext";

function formatDuration(ms) {
  const total = Math.floor((ms || 0) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SongsListClient({ tracks }) {
  const { playTrack, openExpanded } = usePlayback();

  const uiTracks = (tracks || []).map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a) => a.name).join(", ") || "",
    albumArt: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || "",
    previewUrl: t.preview_url || "",
    durationMs: t.duration_ms || 0,
    duration: formatDuration(t.duration_ms),
  }));

  const handlePlay = (e, track) => {
    e.preventDefault();
    playTrack(
      {
        id: track.id,
        title: track.title,
        artist: track.artist,
        albumArt: track.albumArt,
        previewUrl: track.previewUrl,
        durationMs: track.durationMs,
      },
      uiTracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        albumArt: t.albumArt,
        previewUrl: t.previewUrl,
        durationMs: t.durationMs,
      }))
    );
    openExpanded();
  };

  return (
    <div className="px-4">
      {uiTracks.map((track) => (
        <div
          key={track.id}
          onClick={(e) => handlePlay(e, track)}
          className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
            <img
              src={track.albumArt || "/placeholder.png"}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-gray-900 dark:text-white truncate">{track.title}</p>
            <p className="text-[12px] text-gray-600 dark:text-white/60 truncate">{track.artist}</p>
          </div>
          <span className="text-[12px] text-gray-600 dark:text-white/60">{track.duration}</span>
        </div>
      ))}
    </div>
  );
}
