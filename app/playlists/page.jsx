import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserProfile, getPlaylists } from "../lib/spotify";

export const dynamic = "force-dynamic";

async function fetchPlaylistsData(accessToken) {
  const results = await Promise.allSettled([
    getUserProfile(accessToken),
    getPlaylists(accessToken, 50),
  ]);

  const hasAuthError = results.some(
    (r) => r.status === "rejected" && r.reason?.status === 401
  );

  if (hasAuthError) {
    return null;
  }

  return {
    userProfile: results[0].status === "fulfilled" ? results[0].value : {},
    playlists: results[1].status === "fulfilled" ? results[1].value : { items: [] },
  };
}

export default async function Playlists() {
  const cookieStore = await cookies();
  const accessTokenCookie = cookieStore.get("access_token");

  if (!accessTokenCookie?.value) {
    redirect("/login");
  }

  const data = await fetchPlaylistsData(accessTokenCookie.value);

  if (!data) {
    redirect("/login");
  }

  const { userProfile, playlists } = data;

  // Separate owned playlists from followed playlists
  const ownedPlaylists = playlists.items?.filter(
    (p) => p.owner?.id === userProfile.id
  ) || [];
  const followedPlaylists = playlists.items?.filter(
    (p) => p.owner?.id !== userProfile.id
  ) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FF6A00] via-black to-[#EE0979]">
      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-black/30 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Spotify</h1>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/playlists" className="text-white font-semibold">Playlists</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-white/50 text-sm uppercase tracking-wider">Library</p>
              <h2 className="text-4xl font-bold text-white">Your Playlists</h2>
            </div>
          </div>
          <p className="text-white/50 mt-4">
            {playlists.items?.length || 0} playlists • {ownedPlaylists.length} created by you
          </p>
        </section>

        {/* Created Playlists */}
        {ownedPlaylists.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full"></span>
              Created by You
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {ownedPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* Followed Playlists */}
        {followedPlaylists.length > 0 && (
          <section className="pb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-pink-500 rounded-full"></span>
              Following
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {followedPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {playlists.items?.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No playlists yet</h3>
            <p className="text-white/50">Create your first playlist on Spotify to see it here.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function PlaylistCard({ playlist }) {
  const totalDuration = playlist.tracks?.total || 0;
  
  return (
    <a
      href={playlist.external_urls?.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="group backdrop-blur-xl bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer block"
    >
      <div className="relative mb-4">
        {playlist.images?.[0]?.url ? (
          <img
            src={playlist.images[0].url}
            alt={playlist.name}
            className="w-full aspect-square object-cover rounded-xl"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end justify-center pb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {playlist.public === false && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="text-white font-semibold text-sm truncate">{playlist.name}</h3>
      <p className="text-white/50 text-xs mt-1 truncate">
        {playlist.owner?.display_name} • {totalDuration} tracks
      </p>
      {playlist.description && (
        <p className="text-white/30 text-xs mt-2 line-clamp-2">{playlist.description.replace(/<[^>]*>/g, '')}</p>
      )}
    </a>
  );
}
