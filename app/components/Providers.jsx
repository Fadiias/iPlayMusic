"use client";

import { SpotifyProvider } from "./player/SpotifyContext";
import { PlaybackProvider } from "./player/PlaybackContext";
import Player from "./player/Player";

export default function Providers({ children }) {
  return (
    <SpotifyProvider>
      <PlaybackProvider>
        {children}
        <Player />
      </PlaybackProvider>
    </SpotifyProvider>
  );
}
