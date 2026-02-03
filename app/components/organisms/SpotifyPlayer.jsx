"use client";

import { useEffect, useRef } from 'react';

const VOLUME_EVENT = 'iplaymusic-volume-change';

export function SpotifyPlayer({ accessToken, onPlayerReady, onPlayerStateChanged, onInitError }) {
  const playerRef = useRef(null);
  const accessTokenRef = useRef(accessToken);
  const callbacksRef = useRef({ onPlayerReady, onPlayerStateChanged, onInitError });

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    callbacksRef.current = { onPlayerReady, onPlayerStateChanged, onInitError };
  }, [onPlayerReady, onPlayerStateChanged, onInitError]);

  useEffect(() => {
    if (!accessToken) return;

    if (typeof navigator?.requestMediaKeySystemAccess !== 'function') {
      callbacksRef.current?.onInitError?.('Browser does not support Spotify playback');
      return;
    }

    let cancelled = false;
    let pollIntervalId = null;

    const initPlayer = () => {
      if (cancelled) return;
      if (!window?.Spotify?.Player) return;
      if (playerRef.current) return;

      const player = new window.Spotify.Player({
        name: 'iPlayMusic Web Player',
        getOAuthToken: (cb) => {
          fetch('/api/auth/session')
            .then((r) => r.json())
            .then((data) => {
              const t = data?.accessToken;
              if (t) {
                accessTokenRef.current = t;
                cb(t);
              } else {
                cb(accessTokenRef.current || '');
              }
            })
            .catch(() => cb(accessTokenRef.current || ''));
        },
        volume: 0.5,
      });

      player.addListener('initialization_error', ({ message }) => {
        callbacksRef.current?.onInitError?.(message);
        if (playerRef.current) {
          try { player.disconnect(); } catch {}
          playerRef.current = null;
        }
      });

      player.addListener('authentication_error', ({ message }) => {
        callbacksRef.current?.onInitError?.(message);
      });

      player.addListener('account_error', () => {
        callbacksRef.current?.onInitError?.('Spotify Premium required for full playback');
      });

      player.addListener('playback_error', () => {
        // Non-fatal: can happen when nothing is loaded yet
      });

      player.addListener('ready', ({ device_id }) => {
        if (!cancelled) callbacksRef.current?.onPlayerReady?.(device_id, player);
        if (cancelled) return;
        const initVol = typeof window?.__iplaymusicVolume === 'number' ? window.__iplaymusicVolume : 0.85;
        player.setVolume(initVol).catch(() => {});
        pollIntervalId = setInterval(() => {
          if (cancelled || !playerRef.current) return;
          player.getCurrentState().then((state) => {
            if (state && !cancelled) callbacksRef.current?.onPlayerStateChanged?.(state);
          }).catch(() => {});
        }, 250);
      });

      player.addListener('not_ready', () => {});

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        callbacksRef.current?.onPlayerStateChanged?.(state);
      });

      playerRef.current = player;
      player.connect();
    };

    const sdkSrc = 'https://sdk.scdn.co/spotify-player.js';
    const existingScript = document.querySelector(`script[src="${sdkSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = sdkSrc;
      script.async = true;
      document.body.appendChild(script);
    }

    if (window?.Spotify?.Player) {
      initPlayer();
    } else {
      const prev = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (typeof prev === 'function') prev();
        initPlayer();
      };
    }

    return () => {
      cancelled = true;
      if (pollIntervalId) clearInterval(pollIntervalId);
      const player = playerRef.current;
      playerRef.current = null;
      if (player?.disconnect) {
        try { player.disconnect(); } catch {}
      }
    };
  }, [accessToken]);

  useEffect(() => {
    const onVolumeChange = (e) => {
      const v = typeof e?.detail === 'number' ? Math.max(0, Math.min(1, e.detail)) : 0.5;
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(v).catch(() => {});
      }
    };
    window.addEventListener(VOLUME_EVENT, onVolumeChange);
    return () => window.removeEventListener(VOLUME_EVENT, onVolumeChange);
  }, []);

  return null;
}
