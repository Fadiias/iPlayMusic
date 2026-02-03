"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "../../components/organisms/TopBar";
import { BottomNav } from "../../components/organisms/BottomNav";

function formatDurationMs(durationMs) {
  const totalSeconds = Math.max(0, Math.floor((Number(durationMs) || 0) / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AlbumDetailsClient({ album }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);

  const totalSongs = album?.tracks?.length || 0;

  const tracks = useMemo(() => {
    return (album?.tracks || []).map((t) => ({
      id: t.id,
      title: t.title,
      duration: formatDurationMs(t.durationMs),
    }));
  }, [album?.tracks]);

  const handlePlay = () => {
    const first = tracks[0];
    if (first?.id) router.push(`/player?track=${first.id}`);
  };

  const handleShuffle = () => {
    if (!tracks.length) return;
    const random = tracks[Math.floor(Math.random() * tracks.length)];
    if (random?.id) router.push(`/player?track=${random.id}`);
  };

  const handleTrackClick = (trackId) => {
    router.push(`/player?track=${trackId}`);
  };

  return (
    <div className="min-h-screen bg-[#341931]">
      <TopBar title="Album" showBack />

      {/* Album Header - hero image with overlay */}
      <div className="relative h-[400px]">
        <img src={album?.cover} alt={album?.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#341931] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-[36px] font-bold leading-[54px]">{album?.title}</h1>
          <p className="text-[15px] font-bold mt-2">{totalSongs} Songs</p>
          <p className="text-[15px] font-light mt-2">genres hashtags</p>
          <div className="flex gap-3 mt-4">
            <span className="px-4 py-2 rounded-[50px] bg-[#FF1168] text-white font-bold text-[15px]">#country</span>
            <span className="px-4 py-2 rounded-[50px] bg-[#FF1168] text-white font-bold text-[15px]">#country road</span>
          </div>
        </div>
      </div>

      {/* All Songs + Tracklist */}
      <div className="px-4 pb-24">
        <h2 className="text-white font-bold text-[15px] mb-4">All Songs</h2>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            onClick={() => handleTrackClick(track.id)}
            className="flex items-center gap-4 py-3 cursor-pointer hover:bg-white/5 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EE0979] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[15px] truncate">{track.title}</p>
              <p className="text-white/60 font-light text-[12px] truncate">{album?.artist}</p>
            </div>
            <span className="text-white/60 font-light text-[12px]">{track.duration}</span>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
