import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserProfile, getPlaylists, getTopArtists } from "../lib/spotify";
import { BottomNav } from "../components/organisms/BottomNav";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const [userProfile, playlists, topArtists] = await Promise.all([
    getUserProfile(accessToken),
    getPlaylists(accessToken, 50),
    getTopArtists(accessToken, 50),
  ]);

  const followersCount = userProfile.followers?.total || 0;
  const playlistsCount = playlists.total || 0;
  const artistsCount = topArtists.items?.length || 0;

  return (
    <div className="min-h-screen bg-(--color-bg) pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-(--color-bg-alt)">
          {userProfile.images?.[0]?.url ? (
            <img src={userProfile.images[0].url} alt={userProfile.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--color-text-secondary)">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
        <h1 className="text-[22px] font-bold text-(--color-text-primary) mb-1">{userProfile.display_name}</h1>
        <p className="text-[14px] text-(--color-text-secondary)">{userProfile.email}</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-[16px] font-semibold text-(--color-text-primary)">{followersCount}</p>
            <p className="text-[12px] text-(--color-text-secondary)">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-(--color-text-primary)">{artistsCount}</p>
            <p className="text-[12px] text-(--color-text-secondary)">Top Artists</p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-(--color-text-primary)">{playlistsCount}</p>
            <p className="text-[12px] text-(--color-text-secondary)">Playlists</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-(--color-text-primary) mb-3">Account</h2>
        <div className="bg-(--color-bg-alt) rounded-(--radius-card) p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-[14px] text-(--color-text-secondary)">Spotify ID</span>
            <span className="text-[14px] text-(--color-text-primary)">{userProfile.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-(--color-text-secondary)">Country</span>
            <span className="text-[14px] text-(--color-text-primary)">{userProfile.country || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-(--color-text-secondary)">Product</span>
            <span className="text-[14px] text-(--color-text-primary) capitalize">{userProfile.product || 'Free'}</span>
          </div>
          {userProfile.external_urls?.spotify && (
            <a 
              href={userProfile.external_urls.spotify} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center text-[14px] text-(--color-primary) pt-2"
            >
              View on Spotify →
            </a>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <LogoutButton />
      </div>

      <BottomNav />
    </div>
  );
}
