import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTopTracks } from "../lib/spotify";
import { TopBar } from "../components/organisms/TopBar";
import { BottomNav } from "../components/organisms/BottomNav";
import SongsListClient from "./SongsListClient";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const topTracks = await getTopTracks(accessToken, 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
      <TopBar title="MUSIC" />

      <div className="px-[25px] pt-4 mb-6">
        <h1 className="text-[36px] font-bold leading-[54px]">
          <span className="text-[#FF6A00]">All</span>{" "}
          <span className="text-[#FF1168]">Songs</span>
        </h1>
      </div>

      <SongsListClient tracks={topTracks?.items || []} />

      <BottomNav />
    </div>
  );
}
