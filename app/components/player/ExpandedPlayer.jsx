"use client";

import { useEffect, useRef } from "react";
import { usePlayback } from "./PlaybackContext";
import { useSpotify } from "./SpotifyContext";

function IconControl({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95 shrink-0"
    >
      {children}
    </button>
  );
}

export default function ExpandedPlayer() {
  const {
    currentTrack,
    hasTrack,
    isExpanded,
    closeExpanded,
    isPlaying,
    togglePlay,
    next,
    previous,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    error,
    clearError,
    formatClock,
  } = usePlayback();
  const { sdkFailed, retrySdk } = useSpotify();

  const open = Boolean(isExpanded);
  const containerRef = useRef(null);
  const safeDuration = Math.max(0, Number(duration) || 0);
  const safeTime = Math.max(0, Number(currentTime) || 0);
  const progressPct = safeDuration > 0 ? Math.min(100, (safeTime / safeDuration) * 100) : 0;
  const volumePct = Math.round((volume ?? 0.85) * 100);

  useEffect(() => {
    if (!open && containerRef.current?.contains(document.activeElement)) {
      (document.activeElement)?.blur?.();
    }
  }, [open]);

  if (!hasTrack || !currentTrack) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[70] transition-opacity duration-300 flex flex-col ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Concert-like background - blurred album art or gradient */}
      <div className="absolute inset-0 z-0">
        {currentTrack?.albumArt ? (
          <img
            src={currentTrack.albumArt}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#0a0510] to-black" />
      </div>

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-8 sm:pt-12 pb-2">
        <button
          type="button"
          onClick={() => {
            (document.activeElement)?.blur?.();
            closeExpanded();
          }}
          aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-medium text-[15px] tracking-[0.2em] uppercase">
          PLAYING
        </span>
        <div className="w-10" />
      </div>

      {/* Main content - scrollable for small screens */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-2 pb-24 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Circular album art with concentric gradient rings + wavy lines */}
        <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] flex items-center justify-center shrink-0">
          {/* Wavy lines - curved sound waves around the album art */}
          <svg className="absolute inset-[-20px] w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] pointer-events-none overflow-visible" viewBox="0 0 320 320">
            <defs>
              <linearGradient id="expanded-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF1168" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#EE0979" stopOpacity="0.8" />
              </linearGradient>
              <filter id="expanded-wave-glow">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Left side waves */}
            <path d="M 20 80 Q 35 60, 50 80 T 80 80 T 110 80 T 140 80" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.7 }} />
            <path d="M 20 120 Q 40 100, 60 120 T 100 120 T 140 120 T 180 120" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.6, animationDelay: "0.1s" }} />
            <path d="M 20 160 Q 45 140, 70 160 T 120 160 T 170 160" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.5, animationDelay: "0.2s" }} />
            {/* Right side waves */}
            <path d="M 300 80 Q 285 60, 270 80 T 240 80 T 210 80 T 180 80" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.7 }} />
            <path d="M 300 120 Q 280 100, 260 120 T 220 120 T 180 120 T 140 120" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.6, animationDelay: "0.1s" }} />
            <path d="M 300 160 Q 275 140, 250 160 T 200 160 T 150 160" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.5, animationDelay: "0.2s" }} />
            {/* Top waves */}
            <path d="M 120 20 Q 140 35, 160 20 T 200 20 T 240 20" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.6, animationDelay: "0.15s" }} />
            {/* Bottom waves */}
            <path d="M 120 300 Q 140 285, 160 300 T 200 300 T 240 300" fill="none" stroke="url(#expanded-wave-grad)" strokeWidth="2" strokeLinecap="round" className={isPlaying ? "animate-wave-flow" : ""} style={{ opacity: 0.6, animationDelay: "0.2s" }} />
          </svg>
          {/* Outer gradient ring - pink/magenta to dark purple - shakes when playing */}
          <div className={`absolute inset-0 rounded-full p-[10px] bg-gradient-to-br from-[#FF1168] via-[#EE0979] to-[#6B2D5C] shadow-[0_0_35px_rgba(255,17,104,0.3)] transition-transform ${isPlaying ? "animate-speaker-shake" : ""}`}>
            {/* Inner ring + album art */}
            <div className="w-full h-full rounded-full border-2 border-[#FF1168]/90 overflow-hidden shadow-[0_0_15px_rgba(255,17,104,0.2)]">
              {currentTrack?.albumArt ? (
                <img src={currentTrack.albumArt} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FF6A00] to-[#EE0979] flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Song info */}
        <div className="mt-4 sm:mt-6 text-center w-full max-w-[320px]">
          <h2 className="text-white font-bold text-[24px] leading-tight truncate">
            {currentTrack?.title || "Unknown"}
          </h2>
          <p className="text-white/70 text-[15px] mt-1 truncate">
            {currentTrack?.artist || ""}
          </p>
        </div>

        {error ? (
          <div className="mt-4 px-4 py-3 rounded-lg bg-white/10 text-white/90 text-sm">
            <p className="flex-1">{error}</p>
            <p className="mt-2 text-[11px] text-white/70">
              Use Chrome or Edge. Play a song in the Spotify app first, then try again.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {currentTrack?.id && (
                <a
                  href={`https://open.spotify.com/track/${currentTrack.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#1DB954] text-white text-[13px] font-semibold hover:bg-[#1ed760] transition-colors"
                >
                  Open in Spotify
                </a>
              )}
              {sdkFailed && (
                <button type="button" onClick={() => { retrySdk(); clearError(); }} className="px-4 py-2 rounded-full bg-[#FF1168] text-white text-[13px] font-semibold hover:bg-[#FF1168]/90 transition-colors">
                  Retry Player
                </button>
              )}
              <button type="button" onClick={clearError} className="px-4 py-2 rounded-full bg-white/20 text-white text-[13px] font-semibold hover:bg-white/30">
                OK
              </button>
            </div>
          </div>
        ) : null}

        {/* Progress bar */}
        <div className="mt-4 sm:mt-6 w-full max-w-[320px]">
          <input
            type="range"
            min={0}
            max={safeDuration || 1}
            value={safeTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF1168]
              [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,17,104,0.6)] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF1168]"
            style={{
              background: `linear-gradient(to right, #FF1168 0%, #FF1168 ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%, rgba(255,255,255,0.2) 100%)`,
            }}
            aria-label="Seek"
          />
          <div className="flex justify-between mt-2 text-[12px] text-white/70 tabular-nums">
            <span>{formatClock(safeTime)}</span>
            <span>{formatClock(safeDuration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-4 relative z-20">
          {/* Skip to previous |< */}
          <IconControl label="Skip to previous" onClick={previous}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm4.5 6l8.5 6V6l-8.5 6z" />
            </svg>
          </IconControl>
          {/* Rewind << */}
          <IconControl label="Rewind 10 seconds" onClick={() => seek(Math.max(0, safeTime - 10))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
            </svg>
          </IconControl>
          {/* Play / Pause - gradient circle, pink to orange */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-[72px] h-[72px] rounded-full bg-gradient-to-r from-[#FF1168] via-[#FF6A00] to-[#EE0979] text-white flex items-center justify-center shadow-[0_8px_32px_rgba(255,17,104,0.45)] hover:opacity-95 hover:scale-105 active:scale-100 transition-all"
          >
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          {/* Fast forward >> */}
          <IconControl label="Forward 10 seconds" onClick={() => seek(Math.min(safeDuration, safeTime + 10))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18V6l8.5 6L4 18zm9-12v12l8.5-6z" />
            </svg>
          </IconControl>
          {/* Skip to next >| */}
          <IconControl label="Skip to next" onClick={next}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6v12l8.5-6zM16 6v12h2V6z" />
            </svg>
          </IconControl>
        </div>

        {/* Volume slider */}
        <div className="mt-4 sm:mt-6 w-full max-w-[280px] flex items-center gap-3 pb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/80 shrink-0">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume ?? 0.85}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-white/20
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF1168]
              [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,17,104,0.5)] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF1168]"
            style={{
              background: `linear-gradient(to right, #FF1168 0%, #FF1168 ${volumePct}%, rgba(255,255,255,0.2) ${volumePct}%, rgba(255,255,255,0.2) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
