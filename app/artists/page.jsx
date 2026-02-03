import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTopArtists } from "../lib/spotify";
import { TopBar } from "../components/organisms/TopBar";
import { BottomNav } from "../components/organisms/BottomNav";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const topArtists = await getTopArtists(accessToken, 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
      <TopBar title="MUSIC" />

      <div className="px-[25px] pt-4 mb-6">
        <h1 className="text-[36px] font-bold leading-[54px]">
          <span className="text-gray-900 dark:text-white">All</span>{" "}
          <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">Artists</span>
        </h1>
      </div>

      {/* Artists List */}
      <div className="px-4">
        {topArtists.items?.map((artist) => (
          <div
            key={artist.id}
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0">
              <img 
                src={artist.images?.[0]?.url || '/placeholder.png'} 
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-white truncate">{artist.name}</p>
              <p className="text-[12px] text-white/60">Artist</p>
            </div>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
