"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SpotifyPlayer } from "../components/organisms/SpotifyPlayer";
import { getUserProfile } from "../lib/spotify";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerControls({ track, accessToken }) {
  const router = useRouter();
  const audioRef = useRef(null);
  const sdkActivatedRef = useRef(false);
  const sdkUserActivatedRef = useRef(false);
  const pendingSpotifyTrackUriRef = useRef(null);
  const [isPremium, setIsPremium] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState("idle");
  const [audioError, setAudioError] = useState("");
  const [useSpotifySDK, setUseSpotifySDK] = useState(true); // SDK requires Spotify Premium
  const [spotifyPlayer, setSpotifyPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const hasPreview = Boolean(track?.previewUrl);
  const trackDuration = useMemo(() => Math.max(0, Number(track?.duration || 0)), [track?.duration]);
  const duration = useMemo(() => {
    const d = Number(mediaDuration) || 0;
    if (Number.isFinite(d) && d > 0) return d;
    return trackDuration;
  }, [mediaDuration, trackDuration]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!accessToken) {
        setIsPremium(null);
        return;
      }
      try {
        const profile = await getUserProfile(accessToken);
        const premium = profile?.product === "premium";
        if (!cancelled) {
          setIsPremium(premium);
          if (!premium) {
            setUseSpotifySDK(false);
            setAudioError("🎵 Free account: playing 30s previews only");
          }
        }
      } catch {
        if (!cancelled) setIsPremium(null);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const transferPlaybackToDevice = async (id) => {
    if (!id || !accessToken) return false;

    try {
      const resp = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ device_ids: [id], play: false }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.warn("Spotify transfer playback failed:", { status: resp.status, data });

        if (resp.status === 429) {
          const retryAfter = resp.headers.get("Retry-After");
          setAudioError(`Too many requests. Try again in ${retryAfter || "a moment"}.`);
        } else if (resp.status === 403) {
          setAudioError("Spotify Premium required for full playback. Using preview.");
        } else if (resp.status === 404) {
          setAudioError("No active Spotify device. Open Spotify and try again.");
        }
        return false;
      }
      return true;
    } catch (e) {
      console.warn("Spotify transfer playback network error:", e?.message || e);
      return false;
    }
  };

  const handlePlayerReady = async (id, player) => {
    setDeviceId(id);
    setSpotifyPlayer(player);
    console.log("Spotify Player Ready:", id);

    // Note: we intentionally do NOT transfer playback here.
    // Web Playback SDK often requires a user gesture (activateElement) before it can become the active device.
    sdkActivatedRef.current = false;

    // If user already pressed Play earlier, try to start playback now.
    const pendingUri = pendingSpotifyTrackUriRef.current;
    if (pendingUri && sdkUserActivatedRef.current && useSpotifySDK) {
      setAudioStatus("loading");
      setAudioError("");
      const transferred = await transferPlaybackToDevice(id);
      sdkActivatedRef.current = Boolean(transferred);
      if (sdkActivatedRef.current) {
        await playTrackOnSpotify(pendingUri, { deviceIdOverride: id });
      } else {
        setUseSpotifySDK(false);
      }
      pendingSpotifyTrackUriRef.current = null;
    }
  };

  const handlePlayerStateChanged = (state) => {
    if (!state) return;
    
    setIsPlaying(!state.paused);
    setCurrentTime(Math.floor(state.position / 1000));
    
    if (state.track_window?.current_track) {
      const trackDurationMs = state.track_window.current_track.duration_ms;
      setMediaDuration(Math.floor(trackDurationMs / 1000));
    }
  };

  const playTrackOnSpotify = async (
    trackUri,
    { retriedAfterTransfer = false, deviceIdOverride = null } = {}
  ) => {
    if (!accessToken) {
      setAudioError("Not logged in.");
      setUseSpotifySDK(false);
      return;
    }
    const targetDeviceId = deviceIdOverride || deviceId;
    if (!targetDeviceId) {
      setAudioError("Spotify player is still starting…");
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${targetDeviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Spotify Web Playback failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          setAudioError(`Too many requests. Try again in ${retryAfter || "a moment"}.`);
          setUseSpotifySDK(false);
          return;
        }

        // Premium required error
        if (response.status === 403) {
          console.log('Spotify Premium required - falling back to preview mode');
          setAudioError('🎵 Playing 30s preview (Premium needed for full tracks)');
        } else if (response.status === 404) {
          // Most common cause: SDK device not activated yet.
          if (!retriedAfterTransfer) {
            const transferred = await transferPlaybackToDevice(targetDeviceId);
            if (transferred) {
              sdkActivatedRef.current = true;
              return playTrackOnSpotify(trackUri, { retriedAfterTransfer: true, deviceIdOverride: targetDeviceId });
            }
          }
          console.log('Device not found / no active device - falling back to preview mode');
          setAudioError('No active Spotify device. Open Spotify and try again.');
        } else if (response.status === 401) {
          console.log('Token expired - falling back to preview mode');
          setAudioError('Session expired. Using preview.');
        } else {
          console.log(`Spotify error ${response.status} - falling back to preview mode`);
          setAudioError('Using preview mode.');
        }
        
        setUseSpotifySDK(false);
        return;
      }
      
      console.log('Successfully started playback on Spotify');
    } catch (error) {
      console.warn('Network error playing track:', error.message);
      setAudioError('Connection error. Using preview.');
      setUseSpotifySDK(false);
    }
  };

  useEffect(() => {
    if (!useSpotifySDK) {
      // When SDK is disabled, use the HTML5 audio element for previews
      const audio = audioRef.current;
      if (!audio) return;
      
      if (hasPreview && isPlaying) {
        audio.play().catch(console.error);
      }
    }
  }, [useSpotifySDK, hasPreview, isPlaying]);

  // Do not auto-call /me/player/play on mount/track-change.
  // Only attempt Spotify playback when the user presses Play.

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // New track: reset UI and audio.
    setIsPlaying(false);
    setCurrentTime(0);
    setMediaDuration(0);
    setAudioStatus("idle");
    setAudioError("");
    try {
      audio.pause();
      audio.currentTime = 0;
      // Force reload when src changes.
      audio.load();
    } catch {
      // ignore
    }
  }, [track?.id, track?.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) setMediaDuration(d);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onWaiting = () => setAudioStatus("loading");
    const onCanPlay = () => setAudioStatus("idle");
    const onError = () => {
      setAudioStatus("error");
      // Best-effort message; browser implementations vary.
      const mediaError = audio.error;
      const code = mediaError?.code;
      setAudioError(code ? `Audio error (code ${code}).` : "Audio failed to load.");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const handleSeek = (e) => {
    const next = Number(e.target.value);
    setCurrentTime(next);
    const audio = audioRef.current;
    if (audio && Number.isFinite(next)) {
      audio.currentTime = next;
    }
  };

  const handleStep = (deltaSeconds) => {
    const audio = audioRef.current;
    if (audio) {
      const next = Math.min(duration, Math.max(0, (audio.currentTime || 0) + deltaSeconds));
      audio.currentTime = next;
      setCurrentTime(next);
      return;
    }
    setCurrentTime((prev) => {
      const next = prev + deltaSeconds;
      return Math.min(duration, Math.max(0, next));
    });
  };

  const togglePlay = async () => {
    if (useSpotifySDK && spotifyPlayer) {
      if (isPremium === false) {
        setUseSpotifySDK(false);
      }
      if (!track?.id) {
        setAudioError("No track selected.");
        return;
      }

      const trackUri = `spotify:track:${track.id}`;

      // If paused and nothing is loaded, togglePlay() can throw "no list loaded".
      // So we explicitly load a track via Web API.
      if (!isPlaying) {
        setAudioStatus("loading");
        setAudioError("");

        // Required in many browsers: must be called in response to a user gesture.
        try {
          if (spotifyPlayer.activateElement) {
            await spotifyPlayer.activateElement();
          }
          sdkUserActivatedRef.current = true;
        } catch {
          // ignore
        }

        // If deviceId isn't ready yet (common on first navigation), queue the play.
        if (!deviceId) {
          pendingSpotifyTrackUriRef.current = trackUri;
          setAudioError("Starting Spotify player…");
          return;
        }

        if (!sdkActivatedRef.current) {
          const transferred = await transferPlaybackToDevice(deviceId);
          sdkActivatedRef.current = Boolean(transferred);
        }

        if (!sdkActivatedRef.current) {
          // If we can't activate the device, Web API will 404. Fallback to preview.
          setAudioError("No active Spotify device. Using preview.");
          setUseSpotifySDK(false);
          return;
        }

        await playTrackOnSpotify(trackUri);
        return;
      }

      try {
        if (spotifyPlayer.pause) {
          await spotifyPlayer.pause();
        } else {
          await spotifyPlayer.togglePlay();
        }
      } catch {
        // ignore
      }
      return;
    }

    if (!hasPreview) {
      // Always try to switch to a preview track in-app.
      setAudioStatus("loading");
      setAudioError("");
      router.replace(`/player?pickPreview=1&t=${Date.now()}`);
      router.refresh();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setAudioError("");
      if (audio.paused) {
        setAudioStatus("loading");
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (e) {
      console.error("Audio play failed:", e);
      setIsPlaying(false);
      setAudioStatus("error");
      setAudioError("Browser blocked audio playback or preview failed.");
    }
  };

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const progressBg = `linear-gradient(to right, #FF1168 0%, #FF1168 ${progressPct}%, rgba(0,0,0,0.12) ${progressPct}%, rgba(0,0,0,0.12) 100%)`;

  return (
    <div className="relative flex-1 flex flex-col bg-white text-[#341931] overflow-hidden">
      {/* Spotify Web Playback SDK */}
      {useSpotifySDK && accessToken && (
        <SpotifyPlayer 
          accessToken={accessToken}
          onPlayerReady={handlePlayerReady}
          onPlayerStateChanged={handlePlayerStateChanged}
        />
      )}
      
      {/* Audio (Spotify preview_url is ~30s and may be null) */}
      <audio ref={audioRef} src={track?.previewUrl || undefined} preload="auto" playsInline />

      {/* Decorative waves */}
      <div className="pointer-events-none absolute inset-0 -top-10 flex justify-center opacity-50">
        <svg
          width="520"
          height="260"
          viewBox="0 0 520 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-130"
        >
          <path
            d="M20 160C70 90 120 210 170 140C220 70 270 190 320 120C370 50 420 170 470 100"
            stroke="#341931"
            strokeOpacity="0.22"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M20 200C70 130 120 250 170 180C220 110 270 230 320 160C370 90 420 210 470 140"
            stroke="#341931"
            strokeOpacity="0.12"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M20 120C70 50 120 170 170 100C220 30 270 150 320 80C370 10 420 130 470 60"
            stroke="#341931"
            strokeOpacity="0.10"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 px-6 pt-5">
        <div className="grid grid-cols-3 items-center">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full grid place-items-center hover:bg-black/5 transition-colors justify-self-start"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
          </button>
          <div className="text-center">
            <div className="text-[14px] font-semibold tracking-[0.28em]">PLAYING</div>
          </div>
          <div />
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Vinyl */}
        <div className="mb-8">
          <div
            className={
              "relative w-70 h-70 rounded-full shadow-[0_18px_50px_rgba(0,0,0,0.18)] " +
              "bg-[radial-gradient(circle_at_center,#4b4b4b_0%,#1a1a1a_45%,#000_100%)] " +
              (isPlaying ? "animate-spin [animation-duration:7s]" : "")
            }
          >
            <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
            <div className="absolute inset-6 rounded-full ring-1 ring-white/8" />
            <div className="absolute inset-12 rounded-full ring-1 ring-white/6" />

            {/* Center label */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
                {track?.cover ? (
                  <img src={track.cover} alt={track?.name || "Cover"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10" />
                )}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-3 h-3 rounded-full bg-black/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="text-center w-full max-w-85 mb-6">
          <h2 className="text-[22px] leading-tight font-semibold truncate">{track?.name || ""}</h2>
          <p className="text-[15px] opacity-70 truncate">{track?.artist || ""}</p>
          {useSpotifySDK && deviceId && !audioError && (
            <p className="mt-2 text-[12px] opacity-60 text-green-600">🎵 Playing full track on Spotify</p>
          )}
          {!useSpotifySDK && hasPreview && (
            <p className="mt-2 text-[12px] opacity-60 text-orange-600">🎵 Playing 30s preview</p>
          )}
          {track?.notice && <p className="mt-2 text-[12px] opacity-60">{track.notice}</p>}
          {audioStatus === "loading" && <p className="mt-2 text-[12px] opacity-60">Loading audio…</p>}
          {!hasPreview && audioStatus !== "loading" && !useSpotifySDK && (
            <div className="mt-2 flex flex-col items-center gap-2">
              <p className="text-[12px] opacity-60">No preview audio for this track.</p>
              <button
                type="button"
                onClick={() => {
                  setAudioStatus("loading");
                  setAudioError("");
                  router.replace(`/player?pickPreview=1&t=${Date.now()}`);
                  router.refresh();
                }}
                className="text-[12px] px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
              >
                Find a preview
              </button>
            </div>
          )}
          {audioStatus === "error" && audioError && <p className="mt-2 text-[12px] text-[#FF1168]">{audioError}</p>}
        </div>

        {/* Progress */}
        <div className="w-full max-w-90 mb-9">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{ background: progressBg }}
            className={
              "w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none " +
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 " +
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF1168] " +
              "[&::-webkit-slider-thumb]:shadow-[0_6px_14px_rgba(255,17,104,0.35)] " +
              "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full " +
              "[&::-moz-range-thumb]:bg-[#FF1168]"
            }
            aria-label="Seek"
          />
          <div className="flex justify-between mt-3 text-[12px] opacity-60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => {
              const audio = audioRef.current;
              if (audio) audio.currentTime = 0;
              setCurrentTime(0);
            }}
            className="w-12 h-12 rounded-full bg-linear-to-r from-[#EE0979] to-[#FF6A00] text-white shadow-[0_10px_22px_rgba(238,9,121,0.25)] grid place-items-center hover:opacity-95 transition-opacity"
            aria-label="Skip back"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 12l10 6V6l-10 6zM3 6h2v12H3V6zm3 6l10 6V6L6 12z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleStep(-10)}
            className="w-11 h-11 rounded-full bg-white border border-[#341931]/15 grid place-items-center hover:bg-black/5 transition-colors"
            aria-label="Rewind 10 seconds"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V2L7 6l5 4V7c3.86 0 7 3.14 7 7 0 1.52-.49 2.92-1.31 4.06l1.46 1.46A8.962 8.962 0 0 0 21 14c0-4.97-4.03-9-9-9zm-1 6h2v6h-2v-6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={
              "w-16 h-16 rounded-full bg-linear-to-r from-[#EE0979] to-[#FF6A00] text-white shadow-[0_16px_30px_rgba(255,106,0,0.25)] grid place-items-center transition-opacity " +
              (hasPreview ? "hover:opacity-95" : "hover:opacity-95")
            }
            aria-label={hasPreview ? (isPlaying ? "Pause" : "Play") : "Open in Spotify"}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleStep(10)}
            className="w-11 h-11 rounded-full bg-white border border-[#341931]/15 grid place-items-center hover:bg-black/5 transition-colors"
            aria-label="Forward 10 seconds"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5c-1.52 0-2.92.49-4.06 1.31L6.48 4.85A8.962 8.962 0 0 1 12 3c4.97 0 9 4.03 9 9 0 4.97-4.03 9-9 9v3l-5-4 5-4v3c3.86 0 7-3.14 7-7s-3.14-7-7-7zm-1 6h2v6h-2v-6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTime(duration)}
            className="w-12 h-12 rounded-full bg-linear-to-r from-[#EE0979] to-[#FF6A00] text-white shadow-[0_10px_22px_rgba(238,9,121,0.25)] grid place-items-center hover:opacity-95 transition-opacity"
            aria-label="Skip forward"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 12L3 6v12l10-6zm8-6h-2v12h2V6zm-3 6L8 6v12l10-6z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}