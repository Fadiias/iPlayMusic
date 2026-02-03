"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DarkPageHeader } from "../components/layouts/DarkPageHeader";
import { BottomNav } from "../components/organisms/BottomNav";
import { usePlayback } from "../components/player/PlaybackContext";

export default function CategoriesClient({ categories = [], needsAuth = false }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(null);
  const { playTrack, openExpanded } = usePlayback();

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
        <DarkPageHeader title="CATEGORIES" />
        <div className="px-[25px] pt-4 text-center py-12">
          <p className="text-white/90">Log in to Spotify to see categories</p>
          <button onClick={() => router.push("/login")} className="mt-4 px-6 py-3 rounded-full bg-[#FF1168] text-white font-semibold">
            Log in to Spotify
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handlePlayTrack = (track, allTracks) => {
    playTrack(track, allTracks);
    openExpanded();
  };

  return (
    <div className="min-h-screen bg-[#341931] pb-24">
      <DarkPageHeader title="CATEGORIES" />
      <div className="px-[25px] pt-4">
        <h1 className="text-[36px] font-bold leading-[54px] mb-8">
          <span className="text-[#FF6A00]">Cat</span>
          <span className="text-[#FF1168]">egories</span>
        </h1>

        <div className="space-y-2">
          {categories.map((genre) => (
            <div key={genre.id}>
              <button
                onClick={() => setExpanded(expanded === genre.id ? null : genre.id)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-[8px] text-white font-bold text-[15px] transition-opacity hover:opacity-95"
                style={{ backgroundColor: genre.color }}
              >
                {genre.name}
                <span className="text-white/80 text-[12px] font-normal">
                  {genre.tracks?.length ?? 0} songs
                </span>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${expanded === genre.id ? "rotate-180" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {expanded === genre.id && (
                <div className="pt-3 pb-4 bg-gray-50 dark:bg-[#341931]">
                  {(genre.tracks || []).length > 0 ? (
                    <div className="space-y-1">
                      {(genre.tracks || []).map((track) => (
                        <div
                          key={track.id}
                          onClick={() => handlePlayTrack(track, genre.tracks)}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
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
                          <span className="text-[12px] text-gray-600 dark:text-white/60 shrink-0">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-white/50 text-[14px] py-4 text-center">No songs found for this category</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
