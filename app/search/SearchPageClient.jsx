"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/organisms/BottomNav";
import { usePlayback } from "../components/player/PlaybackContext";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80";

export default function SearchPageClient() {
  const router = useRouter();
  const { playTrack, openExpanded } = usePlayback();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const [browseData, setBrowseData] = useState({
    featured: [],
    newReleases: [],
    categories: [],
    playlists: [],
  });
  const [browseLoading, setBrowseLoading] = useState(true);
  const debounceRef = useRef(null);

  const fetchBrowse = useCallback(async () => {
    try {
      const res = await fetch("/api/search/browse");
      const data = await res.json();
      if (data?.ok) {
        setBrowseData({
          featured: data.featured ?? [],
          newReleases: data.newReleases ?? [],
          categories: data.categories ?? [],
          playlists: data.playlists ?? [],
        });
      }
    } catch {
      setBrowseData({ featured: [], newReleases: [], categories: [], playlists: [] });
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data?.ok) {
        setSearchResults({
          tracks: data.tracks ?? [],
          artists: data.artists ?? [],
          albums: data.albums ?? [],
          playlists: data.playlists ?? [],
        });
      } else {
        setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
      }
    } catch {
      setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchBrowse();
  }, [fetchBrowse]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const hasQuery = query.trim().length >= 2;
  const hasSearchResults =
    searchResults.tracks.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.albums.length > 0 ||
    searchResults.playlists.length > 0;
  const showBrowse = !hasQuery;
  const showSearchResults = hasQuery && (hasSearchResults || !isSearching);

  const handlePlayTrack = (track, allTracks) => {
    playTrack(track, allTracks);
    openExpanded();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#341931] pb-24 transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white dark:bg-[#341931] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Back"
              onClick={() => {
                try {
                  router.back();
                } catch {
                  router.push("/");
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="What do you want to listen to?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/10 rounded-full text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 outline-none focus:ring-2 focus:ring-[#FF1168] transition-colors"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 dark:text-white/70"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-[28px] font-bold text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">Search</span>
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6">
        {isSearching && (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#FF1168] border-t-transparent animate-spin" />
            <p className="text-gray-500 dark:text-white/60 text-sm">Searching Spotify...</p>
          </div>
        )}

        {!isSearching && showSearchResults && (
          <div className="py-6 space-y-8">
            {searchResults.tracks.length > 0 && (
              <section>
                <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Songs</h2>
                <div className="space-y-1">
                  {searchResults.tracks.slice(0, 10).map((track) => (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(track, searchResults.tracks)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                        <img
                          src={track.albumArt || PLACEHOLDER_IMG}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{track.title}</p>
                        <p className="text-[13px] text-gray-600 dark:text-white/60 truncate">{track.artist}</p>
                      </div>
                      <span className="text-[12px] text-gray-500 dark:text-white/50 tabular-nums shrink-0">{track.duration}</span>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EE0979] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {searchResults.artists.length > 0 && (
              <section>
                <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Artists</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                  {searchResults.artists.map((artist) => (
                    <a
                      key={artist.id}
                      href={`https://open.spotify.com/artist/${artist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-36 flex flex-col items-center text-center group"
                    >
                      <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity">
                        <img
                          src={artist.image || PLACEHOLDER_IMG}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate w-full">{artist.name}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {searchResults.albums.length > 0 && (
              <section>
                <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Albums</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                  {searchResults.albums.map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      onClick={() => router.push(`/albums/${album.id}`)}
                      className="shrink-0 w-36 flex flex-col items-start text-left group"
                    >
                      <div className="w-36 h-36 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity shadow-lg">
                        <img
                          src={album.image || PLACEHOLDER_IMG}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate w-full">{album.name}</p>
                      <p className="text-[12px] text-gray-600 dark:text-white/60 truncate w-full">{album.artist}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {searchResults.playlists.length > 0 && (
              <section>
                <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Playlists</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                  {searchResults.playlists.map((playlist) => (
                    <a
                      key={playlist.id}
                      href={`https://open.spotify.com/playlist/${playlist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-36 flex flex-col items-start text-left group"
                    >
                      <div className="w-36 h-36 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity shadow-lg">
                        <img
                          src={playlist.image || PLACEHOLDER_IMG}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate w-full">{playlist.name}</p>
                      <p className="text-[12px] text-gray-600 dark:text-white/60 truncate w-full">{playlist.owner}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {hasQuery && !hasSearchResults && (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-white/60">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        )}

        {!isSearching && showBrowse && (
          <div className="py-6 space-y-8">
            {browseLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#FF1168] border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {browseData.categories.length > 0 && (
                  <section>
                    <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Browse all</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {browseData.categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => router.push("/categories")}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-left"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                            <img src={cat.image || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {browseData.featured.length > 0 && (
                  <section>
                    <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Featured playlists</h2>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                      {browseData.featured.map((item) => (
                        <a
                          key={item.id}
                          href={`https://open.spotify.com/playlist/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-40 flex flex-col group"
                        >
                          <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity">
                            <img src={item.image || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[12px] text-gray-600 dark:text-white/60 truncate">{item.description || "Spotify"}</p>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {browseData.newReleases.length > 0 && (
                  <section>
                    <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">New releases</h2>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                      {browseData.newReleases.map((album) => (
                        <button
                          key={album.id}
                          type="button"
                          onClick={() => router.push(`/albums/${album.id}`)}
                          className="shrink-0 w-36 flex flex-col items-start text-left group"
                        >
                          <div className="w-36 h-36 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity shadow-lg">
                            <img src={album.image || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate w-full">{album.name}</p>
                          <p className="text-[12px] text-gray-600 dark:text-white/60 truncate w-full">{album.artist}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {browseData.playlists.length > 0 && (
                  <section>
                    <h2 className="text-gray-900 dark:text-white font-bold text-[18px] mb-4">Your playlists</h2>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1">
                      {browseData.playlists.map((pl) => (
                        <a
                          key={pl.id}
                          href={`https://open.spotify.com/playlist/${pl.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-36 flex flex-col group"
                        >
                          <div className="w-36 h-36 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 group-hover:opacity-90 transition-opacity">
                            <img src={pl.image || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="mt-2 font-semibold text-[14px] text-gray-900 dark:text-white truncate w-full">{pl.name}</p>
                          <p className="text-[12px] text-gray-600 dark:text-white/60">{pl.trackCount ?? 0} tracks</p>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {!browseLoading &&
                  browseData.categories.length === 0 &&
                  browseData.featured.length === 0 &&
                  browseData.newReleases.length === 0 &&
                  browseData.playlists.length === 0 && (
                    <div className="py-12 text-center text-gray-500 dark:text-white/60">Start typing to search Spotify</div>
                  )}
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
