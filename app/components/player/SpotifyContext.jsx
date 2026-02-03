"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SpotifyPlayer } from "../organisms/SpotifyPlayer";

const SpotifyContext = createContext(null);

export function SpotifyProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [spotifyState, setSpotifyState] = useState({ isPlaying: false, positionMs: 0, durationMs: 0, currentTrack: null });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [sessionRes, meRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/me"),
        ]);
        if (cancelled) return;
        const session = await sessionRes.json();
        const me = await meRes.json();
        if (session?.accessToken) {
          setAccessToken(session.accessToken);
          setIsPremium(me?.product === "premium");
          setSdkFailed(false);
        }
      } catch {
        if (!cancelled) setAccessToken(null);
      }
    };
    load();
    const interval = setInterval(load, 50 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handlePlayerReady = useCallback((id) => {
    setDeviceId(id);
    setSdkFailed(false);
  }, []);

  const handleInitError = useCallback((message) => {
    setSdkFailed(true);
    setDeviceId(null);
  }, []);

  const handlePlayerStateChanged = useCallback((state) => {
    if (!state) return;
    const t = state.track_window?.current_track;
    const currentTrack = t
      ? {
          id: t.id || t.uri?.split(":")?.pop?.(),
          uri: t.uri,
          title: t.name || "Unknown",
          artist: t.artists?.map((a) => a?.name).filter(Boolean).join(", ") || "Unknown artist",
          albumArt: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || "",
          durationMs: t.duration_ms || 0,
        }
      : null;
    setSpotifyState({
      isPlaying: !state.paused,
      positionMs: state.position || 0,
      durationMs: t?.duration_ms || 0,
      currentTrack,
    });
  }, []);

  const effectiveDeviceId = sdkFailed ? null : deviceId;

  const retrySdk = useCallback(() => {
    setSdkFailed(false);
    setDeviceId(null);
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <SpotifyContext.Provider value={{ accessToken, deviceId: effectiveDeviceId, isPremium, sdkFailed, spotifyState, retrySdk }}>
      {accessToken && (
        <SpotifyPlayer
          key={retryKey}
          accessToken={accessToken}
          onPlayerReady={handlePlayerReady}
          onPlayerStateChanged={handlePlayerStateChanged}
          onInitError={handleInitError}
        />
      )}
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const ctx = useContext(SpotifyContext);
  return ctx || { accessToken: null, deviceId: null, isPremium: false, sdkFailed: false, spotifyState: { isPlaying: false, positionMs: 0, durationMs: 0, currentTrack: null }, retrySdk: () => {} };
}
