import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getNewReleases } from "../lib/spotify";
import { DarkPageHeader } from "../components/layouts/DarkPageHeader";
import { BottomNav } from "../components/organisms/BottomNav";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  let newReleases = { albums: { items: [] } };
  try {
    newReleases = await getNewReleases(accessToken, 20);
  } catch (e) {
    console.error("Failed to fetch albums:", e);
  }

  const albums = newReleases?.albums?.items || [];
  const featured = albums.slice(0, 3);
  const rest = albums.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
      <DarkPageHeader title="MUSIC" />
      <div className="px-[25px] pt-4">
        <h1 className="text-[36px] font-bold leading-[54px] mb-8 bg-gradient-to-r from-[#FF1168] to-[#FF6A00] bg-clip-text text-transparent">
          All Albums
        </h1>

        {/* Featured Albums */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900 dark:text-white font-bold text-[15px]">Featured Albums</h2>
            <Link href="/albums" className="text-[#FF1168] font-light text-[15px]">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-[25px] px-[25px]">
            {featured.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="shrink-0 w-[130px]"
              >
                <img
                  src={album.images?.[0]?.url || "/placeholder.png"}
                  alt={album.name}
                  className="w-[130px] h-[130px] rounded-[8px] object-cover shadow-lg"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold text-[15px]">New Releases</h2>
            <Link href="/albums" className="text-[#FF1168] font-light text-[15px]">View All</Link>
          </div>
          <div className="space-y-4">
            {rest.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="flex items-center gap-4 p-2 rounded-[8px] hover:bg-white/5 transition-colors"
              >
                <img
                  src={album.images?.[2]?.url || album.images?.[0]?.url || "/placeholder.png"}
                  alt={album.name}
                  className="w-[50px] h-[50px] rounded-[4px] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[15px] truncate">{album.name}</p>
                  <p className="text-white/70 font-light text-[12px] truncate">
                    {album.artists?.map((a) => a.name).join(", ")}
                  </p>
                </div>
                <span className="text-white/70 font-light text-[12px]">
                  {album.total_tracks || 0} Songs
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
