"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSpotify } from "./SpotifyContext";

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(s / 60);
  const remaining = s % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

const PlaybackContext = createContext(null);

export function PlaybackProvider({ children }) {
  const audioRef = useRef(null);
  const autoPlayRef = useRef(false);
  const spotifyModeRef = useRef(false);
  const userActionLockRef = useRef(false);
  const { deviceId, isPremium, sdkFailed, spotifyState } = useSpotify();

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [error, setError] = useState("");
  const [isSpotifyMode, setIsSpotifyMode] = useState(false);

  const sdkTrack = isSpotifyMode ? spotifyState?.currentTrack : null;
  const queueTrack = currentIndex >= 0 ? (queue?.[currentIndex] ?? null) : null;
  const currentTrack = useMemo(() => {
    if (sdkTrack) return sdkTrack;
    return queueTrack;
  }, [sdkTrack, queueTrack]);

  const hasTrack = Boolean(currentTrack);
  const hasPreview = Boolean(currentTrack?.previewUrl);
  const canUseSpotify = Boolean(isPremium && deviceId && currentTrack?.id);
  const canPlay = hasPreview || canUseSpotify;

  const setVolumeSafe = useCallback((v) => {
    setVolume(clamp(v, 0, 1));
  }, []);

  const openExpanded = useCallback(() => setIsExpanded(true), []);
  const closeExpanded = useCallback(() => setIsExpanded(false), []);

  const loadCurrentTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const trackHasPreview = currentTrack && typeof currentTrack.previewUrl === "string" && currentTrack.previewUrl;
    const trackCanUseSpotify = currentTrack?.id && isPremium && deviceId;

    if (spotifyModeRef.current) {
      setError("");
      return;
    }

    setCurrentTime(0);
    setDuration(0);

    if (!trackHasPreview && !trackCanUseSpotify && currentTrack) {
      const msg = isPremium && sdkFailed
        ? "Web player unavailable. Open in Spotify for full playback."
        : "This track has no preview. Open in Spotify to listen.";
      setError(msg);
    } else {
      setError("");
    }

    if (trackHasPreview) {
      audio.src = currentTrack.previewUrl;
      try {
        audio.currentTime = 0;
        audio.load();
      } catch {
        // ignore
      }
    } else {
      audio.removeAttribute("src");
    }
  }, [currentTrack, isPremium, deviceId, sdkFailed]);

  const play = useCallback(async () => {
    if (!currentTrack) return;
    setError("");

    if (spotifyModeRef.current && deviceId) {
      setIsPlaying(true);
      userActionLockRef.current = true;
      setTimeout(() => { userActionLockRef.current = false; }, 1200);
      try {
        const res = await fetch("/api/player/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          setIsPlaying(false);
          setError("Could not resume. Tap play again.");
        }
      } catch {
        setIsPlaying(false);
        setError("Could not resume. Tap play again.");
      }
      return;
    }

    if (!currentTrack.previewUrl && !(isPremium && deviceId && currentTrack.id)) {
      if (currentTrack.id) {
        try {
          const res = await fetch(`/api/track/${currentTrack.id}`);
          const data = await res.json();
          if (data?.ok && data?.previewUrl) {
            const audio = audioRef.current;
            if (audio) {
              audio.src = data.previewUrl;
              audio.currentTime = 0;
              audio.load();
              await audio.play();
              setIsPlaying(true);
              setError("");
              return;
            }
          }
        } catch {
          //
        }
      }
      setIsPlaying(false);
      setError("This track has no preview. Open in Spotify to listen.");
      return;
    }

    const audio = audioRef.current;
    const previewUrl = currentTrack.previewUrl;
    if (!audio || !previewUrl) return;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      setIsPlaying(false);
      setError("Playback was blocked by the browser. Tap play again.");
    }
  }, [currentTrack, deviceId, isPremium]);

  const pause = useCallback(async () => {
    if (spotifyModeRef.current && deviceId) {
      setIsPlaying(false);
      userActionLockRef.current = true;
      setTimeout(() => { userActionLockRef.current = false; }, 1200);
      try {
        await fetch("/api/player/pause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
      } catch {
        // ignore
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.pause();
    } catch {
      // ignore
    }
    setIsPlaying(false);
  }, [deviceId]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback(async (nextTimeSeconds) => {
    if (spotifyModeRef.current && deviceId) {
      const positionMs = Math.floor(nextTimeSeconds * 1000);
      setCurrentTime(nextTimeSeconds);
      try {
        await fetch("/api/player/seek", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, positionMs }),
        });
      } catch {
        // Poll will correct position
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(Number(audio.duration)) && audio.duration > 0 ? audio.duration : duration;
    const next = clamp(nextTimeSeconds, 0, Math.max(0, max || 0));
    try {
      audio.currentTime = next;
      setCurrentTime(next);
    } catch {
      // ignore
    }
  }, [duration, deviceId]);

  const next = useCallback(async () => {
    if (spotifyModeRef.current && deviceId) {
      try {
        const res = await fetch("/api/player/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        if (res.ok) {
          setCurrentIndex((idx) => {
            const nextIndex = idx + 1;
            if (!Array.isArray(queue) || queue.length === 0) return -1;
            return nextIndex >= queue.length ? 0 : nextIndex;
          });
        }
      } catch {
        // fallback to queue
      }
      return;
    }
    setCurrentIndex((idx) => {
      const nextIndex = idx + 1;
      if (!Array.isArray(queue) || queue.length === 0) return -1;
      return nextIndex >= queue.length ? 0 : nextIndex;
    });
  }, [queue, deviceId]);

  const previous = useCallback(async () => {
    if (spotifyModeRef.current && deviceId) {
      try {
        const res = await fetch("/api/player/previous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        if (res.ok) {
          setCurrentIndex((idx) => {
            if (!Array.isArray(queue) || queue.length === 0) return -1;
            const prevIndex = idx - 1;
            return prevIndex < 0 ? queue.length - 1 : prevIndex;
          });
        }
      } catch {
        // fallback to queue
      }
      return;
    }
    setCurrentIndex((idx) => {
      if (!Array.isArray(queue) || queue.length === 0) return -1;
      const prevIndex = idx - 1;
      return prevIndex < 0 ? queue.length - 1 : prevIndex;
    });
  }, [queue, deviceId]);

  const setQueueAndPlay = useCallback(
    (tracks, startAt = 0) => {
      const nextQueue = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
      setQueue(nextQueue);
      setCurrentIndex(nextQueue.length ? clamp(startAt, 0, Math.max(0, nextQueue.length - 1)) : -1);
      setIsExpanded(false);
    },
    []
  );

  const playTrack = useCallback(
    async (track, tracks = null) => {
      const nextTracks = Array.isArray(tracks) && tracks.length ? tracks : [track].filter(Boolean);
      const startIndex = nextTracks.findIndex((t) => t?.id && track?.id && t.id === track.id);
      const idx = startIndex >= 0 ? startIndex : 0;
      const trackToPlay = nextTracks[idx];

      setQueue(nextTracks);
      setCurrentIndex(nextTracks.length ? idx : -1);
      setIsExpanded(false);
      setError("");

      // Premium: use Spotify Web API for full tracks (deviceId can take a few sec to appear)
      if (isPremium && trackToPlay?.id) {
        if (!deviceId) {
          setError("Starting Spotify player… Tap again in a moment.");
          return;
        }
        spotifyModeRef.current = true;
        setIsSpotifyMode(true);
        const uris = nextTracks.map((t) => t?.id && `spotify:track:${t.id}`).filter(Boolean);
        try {
          await fetch("/api/player/transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId }),
          });
          const playRes = await fetch("/api/player/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              uris: uris.length ? uris : [`spotify:track:${trackToPlay.id}`],
              positionMs: 0,
              offset: uris.length > 1 ? { position: idx } : undefined,
            }),
          });
          if (playRes.ok) {
            setIsPlaying(true);
            setCurrentTime(0);
            const durMs = trackToPlay.durationMs || 0;
            setDuration(durMs ? durMs / 1000 : 0);
          } else {
            const err = await playRes.json();
            spotifyModeRef.current = false;
            setIsSpotifyMode(false);
            setError(err?.error === "SPOTIFY_API_ERROR" ? "Tap play to start." : "Could not play. Tap play to retry.");
          }
        } catch (e) {
          spotifyModeRef.current = false;
          setIsSpotifyMode(false);
          setError("Could not play. Tap play to retry.");
        }
        return;
      }

      // Free/preview: use HTML5 audio
      spotifyModeRef.current = false;
      setIsSpotifyMode(false);
      const previewUrl = trackToPlay && typeof trackToPlay.previewUrl === "string" && trackToPlay.previewUrl;
      if (previewUrl && audioRef.current) {
        autoPlayRef.current = true;
        const audio = audioRef.current;
        try {
          audio.src = previewUrl;
          audio.currentTime = 0;
          audio.load();
          audio.play().then(() => setIsPlaying(true)).catch(() => {
            setIsPlaying(false);
            setError("Tap play to start.");
          });
        } catch {
          autoPlayRef.current = false;
        }
      }
    },
    [isPremium, deviceId]
  );

  // Sync Spotify SDK state when in Spotify mode (skip isPlaying during user action to avoid overwriting)
  useEffect(() => {
    if (!spotifyModeRef.current) return;
    setCurrentTime(spotifyState.positionMs / 1000);
    setDuration(spotifyState.durationMs / 1000);
    if (!userActionLockRef.current && typeof spotifyState.isPlaying === "boolean") {
      setIsPlaying(spotifyState.isPlaying);
    }
  }, [spotifyState.positionMs, spotifyState.durationMs, spotifyState.isPlaying]);

  // Sync currentIndex when Spotify SDK reports a different track (e.g. after next/previous)
  useEffect(() => {
    const sdk = spotifyState?.currentTrack;
    if (!sdk?.id || !Array.isArray(queue) || queue.length === 0) return;
    const idx = queue.findIndex((t) => t?.id === sdk.id);
    if (idx >= 0 && idx !== currentIndex) setCurrentIndex(idx);
  }, [spotifyState?.currentTrack?.id, queue, currentIndex]);

  // Keep audio volume in sync (HTML5 + Spotify SDK).
  useEffect(() => {
    const v = clamp(volume, 0, 1);
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    if (typeof window !== "undefined") {
      window.__iplaymusicVolume = v;
      window.dispatchEvent(new CustomEvent("iplaymusic-volume-change", { detail: v }));
    }
  }, [volume]);

  // Load a new track whenever selection changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (autoPlayRef.current) {
      autoPlayRef.current = false;
      return;
    }

    if (!spotifyModeRef.current) {
      pause();
    }
    loadCurrentTrack();
  }, [currentTrack?.id, currentTrack?.previewUrl, loadCurrentTrack, pause]);

  // Audio event listeners.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      next();
    };
    const onError = () => {
      if (spotifyModeRef.current || !audio.src) return;
      setIsPlaying(false);
      setError("Could not play this preview.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [next]);

  const value = useMemo(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      hasTrack,
      canPlay,
      isPlaying,
      isExpanded,
      currentTime,
      duration,
      volume,
      error,

      openExpanded,
      closeExpanded,
      setVolume: setVolumeSafe,
      seek,
      play,
      pause,
      togglePlay,
      next,
      previous,
      playTrack,
      setQueueAndPlay,
      clearError: () => setError(""),
      formatClock,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      hasTrack,
      canPlay,
      isPlaying,
      isExpanded,
      currentTime,
      duration,
      volume,
      error,
      openExpanded,
      closeExpanded,
      setVolumeSafe,
      seek,
      play,
      pause,
      togglePlay,
      next,
      previous,
      playTrack,
      setQueueAndPlay,
    ]
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      {/* Single audio instance for the entire app */}
      <audio ref={audioRef} preload="auto" playsInline style={{ display: "none" }} />
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error("usePlayback must be used within PlaybackProvider");
  }
  return ctx;
}
