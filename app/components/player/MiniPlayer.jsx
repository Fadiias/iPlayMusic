"use client";

import { usePlayback } from "./PlaybackContext";

export default function MiniPlayer() {
  const {
    currentTrack,
    hasTrack,
    isPlaying,
    togglePlay,
    openExpanded,
  } = usePlayback();

  if (!hasTrack || !currentTrack) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openExpanded}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openExpanded();
      }}
      className="fixed left-3 right-3 bottom-20 z-[60] max-w-md mx-auto rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111625] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-200"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
        {currentTrack?.albumArt ? (
          <img src={currentTrack.albumArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF6A00] to-[#EE0979]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-gray-900 dark:text-white text-[13px] font-semibold truncate">
          {currentTrack?.title || "Unknown"}
        </div>
        <div className="text-gray-600 dark:text-white/60 text-[11px] truncate">
          {currentTrack?.artist || ""}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EE0979] text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 6h3v12H7V6Zm7 0h3v12h-3V6Z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
            <path d="M9 7v10l8-5-8-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
