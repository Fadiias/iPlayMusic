"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../organisms/BottomNav";
import { usePlayback } from "../player/PlaybackContext";

function IconButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/20 active:bg-white/25 transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}

function GradientPlayButton({ onClick, label = "Play", disabled = false, isLoading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled || isLoading}
      className="w-8 h-8 rounded-full bg-linear-to-br from-[#FF1168] to-[#FF6A00] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 7v10l8-5-8-5z" fill="white" />
        </svg>
      )}
    </button>
  );
}

export default function PlaylistDashboard({
  tracks = [],
  featuredTitle = "Top 50 Rock Ballads",
  featuredSubtitle = "Featured playlist",
  coverLeft = "/Group 434.png",
  coverCenter = "/Path 343.png",
  coverRight = "/badges.png",
} = {}) {
  const router = useRouter();
  const hasTracks = Array.isArray(tracks) && tracks.length > 0;

  const { playTrack, setQueueAndPlay, openExpanded } = usePlayback();

  const playableTracks = useMemo(
    () => (Array.isArray(tracks) ? tracks.filter((t) => typeof t?.previewUrl === "string" && t.previewUrl) : []),
    [tracks]
  );

  function listenAll() {
    if (!Array.isArray(tracks) || !tracks.length) return;
    const slice = tracks.slice(0, 10);
    playTrack(slice[0], slice);
    openExpanded();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] text-gray-900 dark:text-white pb-24 transition-colors duration-200">
      <header className="">
        <img
          src="/sound-wave.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full object-cover pointer-events-none select-none"
        />
        <div className="absolute pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-md mx-auto px-6 pt-10 pb-16">
          <div className="flex items-center justify-between">
            <IconButton
              label="Back"
              onClick={() => {
                try {
                  router.back();
                } catch {
                  router.push("/");
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>

            <div className="flex items-center gap-3">
              <span className="text-white/90 font-semibold tracking-[0.25em] text-[12px]">PLAYLISTS</span>
              <button
                onClick={() => router.push("/categories")}
                className="text-white/80 text-[11px] font-medium hover:text-white"
              >
                Categories
              </button>
            </div>

            <IconButton label="Search" onClick={() => router.push("/search")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="white" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>
          </div>

          <h1 className="mt-8 text-white text-[34px] leading-tight font-bold">Playlists</h1>

          <div className="mt-6 relative h-42.5 w-full flex items-center justify-center">
            <div className="absolute left-2 top-10 w-25 h-25 rounded-[18px] overflow-hidden shadow-[0_18px_35px_rgba(0,0,0,0.18)] rotate-[-8deg]">
              <img
                src="https://i.scdn.co/image/ab67616d0000b27353fcfe53c2485f8573e8542e"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute right-2 top-10 w-25 h-25 rounded-[18px] overflow-hidden shadow-[0_18px_35px_rgba(0,0,0,0.18)] rotate-[8deg]">
              <img
                src="https://i.scdn.co/image/ab67616d0000b27332d92d9b5008b703763bf8e2"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative w-38.75 h-38.75 rounded-[22px] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.22)]">
              <img
                src="https://i.scdn.co/image/ab67616d0000b2732e09d63a7ba7fa7071e26524"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 -mt-10">
        <section className="bg-white dark:bg-[#341931] rounded-[22px] px-6 pt-8 pb-6 shadow-lg dark:shadow-none transition-colors duration-200">
          <div className="flex flex-col items-center">
          

            <div className="text-center mt-1">
          <div className="text-[18px] font-semibold text-gray-900 dark:text-white">{featuredTitle}</div>
          <div className="text-[12px] text-gray-600 dark:text-white/60 mt-1">{featuredSubtitle}</div>
            </div>
          </div>

          <div className="mt-8">
            {!hasTracks ? (
              <div className="py-10 text-center">
              <div className="text-[14px] font-semibold text-gray-900 dark:text-white">No tracks yet</div>
              <div className="mt-1 text-[12px] text-gray-600 dark:text-white/60 max-w-60 mx-auto">
                  Listen to music on Spotify to see your top tracks here, or reconnect your account.
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-5 px-6 py-3 rounded-full bg-linear-to-br from-[#FF1168] to-[#FF6A00] text-white font-semibold text-[12px] tracking-[0.18em] hover:opacity-90"
                >
                  CONNECT SPOTIFY
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {tracks.slice(0, 10).map((t, idx) => {
                  const key = `${t?.id || t?.title || "track"}-${idx}`;

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        playTrack(t, tracks.slice(0, 10));
                        openExpanded();
                      }}
                      className="flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <GradientPlayButton
                        label={`Play ${t.title}`}
                        disabled={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(t, tracks.slice(0, 10));
                          openExpanded();
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[14px] leading-5 truncate text-gray-900 dark:text-white">{t.title}</div>
                        <div className="text-[12px] text-gray-600 dark:text-white/55 truncate">{t.artist}</div>
                      </div>
                      <div className="text-[12px] text-gray-600 dark:text-white/55 tabular-nums">{t.duration}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={listenAll}
              disabled={!playableTracks.length}
              className="px-10 py-3 rounded-full border-2 border-[#FF1168] text-[#FF1168] font-semibold tracking-[0.2em] text-[12px] hover:bg-[#FF1168]/10 active:bg-[#FF1168]/20 bg-transparent"
            >
              LISTEN ALL
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
