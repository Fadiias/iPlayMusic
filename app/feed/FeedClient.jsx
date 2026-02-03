"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../components/organisms/BottomNav";

export default function FeedClient({ trends = [], trendingNow = [], needsAuth = false }) {
  const router = useRouter();

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#341931] max-w-[375px] mx-auto pb-24 transition-colors duration-200">
        <div className="px-[25px] pt-[30px] pb-4 flex items-center justify-between text-[#341931] dark:text-white">
          <button onClick={() => router.back()} className="flex items-center justify-center" aria-label="Back">
            <svg width="9" height="15" viewBox="0 0 9 15" fill="none" className="stroke-current">
              <path d="M8 1L1 7.5L8 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[36px] font-bold leading-[54px] text-center">
            <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">Latest</span>{" "}
            <span className="text-[#FF1168]">Trends</span>
          </h1>
          <button onClick={() => router.push("/search")} className="flex items-center justify-center" aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="stroke-current">
              <circle cx="6.5" cy="6.5" r="5.5" strokeWidth="2" />
              <path d="M10 10l4 4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-[25px] pt-20 text-center">
          <p className="text-gray-700 dark:text-white/90">Log in to Spotify to see trends</p>
          <button onClick={() => router.push("/login")} className="mt-4 px-6 py-3 rounded-full bg-[#FF1168] text-white font-semibold">
            Log in to Spotify
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#341931] max-w-[375px] mx-auto pb-24 transition-colors duration-200">
      {/* Header - Group 402: back + search #341931 */}
      <div className="px-[25px] pt-[30px] pb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center justify-center text-[#341931] dark:text-white" aria-label="Back">
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" className="stroke-current">
            <path d="M8 1L1 7.5L8 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-[36px] font-bold leading-[54px] text-center">
          <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">Latest</span>{" "}
          <span className="text-[#FF1168]">Trends</span>
        </h1>
        <button onClick={() => router.push("/search")} className="flex items-center justify-center text-[#341931] dark:text-white" aria-label="Search">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="stroke-current">
            <circle cx="6.5" cy="6.5" r="5.5" strokeWidth="2" />
            <path d="M10 10l4 4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-[25px] pt-2 pb-4 flex gap-3">
        <button onClick={() => router.push("/categories")} className="px-5 py-2.5 rounded-[50px] bg-[#FF1168] text-white font-bold text-[15px]">
          Categories
        </button>
        <button onClick={() => router.push("/events-feed")} className="px-5 py-2.5 rounded-[50px] bg-[#FF1168]/30 dark:bg-white/20 text-[#FF1168] dark:text-white font-bold text-[15px]">
          Events
        </button>
      </div>

      {/* First large card - 325x400, left 25px, top ~70px */}
      <div className="px-[25px] pt-4">
        {trends[0] ? (
          <div className="relative w-full max-w-[325px] h-[400px] rounded-[8px] overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.160784)]">
            <img src={trends[0].image} alt={trends[0].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] to-transparent rounded-[8px]" />
            <div className="absolute top-[21px] right-[49px] w-[65px] h-[65px] rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EE0979] shadow-[0px_0px_7.5px_rgba(0,0,0,0.25)] flex items-center justify-center">
              <img src="/_ionicons_svg_ios-flash.png" alt="" className="w-[21px] h-[36px] object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <div className="px-[45px] pb-4">
                <h2 className="text-[36px] font-bold leading-[54px] text-white font-['Poppins']">{trends[0].title}</h2>
                <p className="text-[15px] font-bold leading-[22px] text-white font-['Poppins']">{trends[0].hashtags}</p>
              </div>
              <div className="px-[49px] pb-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {(trends[0].avatars || []).slice(0, 3).map((avatar, i) => (
                    <img key={i} src={avatar} alt="" className="w-[30px] h-[30px] rounded-full object-cover shadow-[0px_0px_7.5px_rgba(0,0,0,0.75)]" />
                  ))}
                </div>
                <p className="text-[12px] font-bold leading-[18px] text-white font-['Poppins']">{trends[0].engagement}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[325px] h-[400px] rounded-[8px] overflow-hidden bg-gray-200 dark:bg-white/10 flex items-center justify-center">
            <p className="text-gray-500 dark:text-white/80">No featured playlists</p>
          </div>
        )}
      </div>

      {/* Rectangle 17 - Pink section #FF1168, rounded-tl-[8px], contains Trending Now + small cards */}
      <div className="mt-4 bg-[#FF1168] rounded-tl-[8px] shadow-[0px_4px_4px_rgba(0,0,0,0.160784)] px-[25px] pt-8 pb-8">
        <h3 className="text-[20px] font-bold leading-[30px] text-white font-['Poppins'] mb-4">
          Trending<br />Now
        </h3>
        <div className="flex gap-[15px] overflow-x-auto scrollbar-hide pb-2">
          {trendingNow.length > 0 ? (
            trendingNow.map((item) => (
              <div key={item.id} className="relative w-[130px] h-[130px] shrink-0 rounded-[8px] overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.16)]">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111111] to-transparent rounded-[8px]" />
                <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center">
                  <p className="text-[15px] font-bold leading-[22px] text-white font-['Poppins'] text-center">{item.title}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 text-[14px]">No categories</p>
          )}
        </div>
      </div>

      {/* Second large card */}
      {trends[1] && (
        <div className="px-[25px] pt-8 pb-8">
          <div className="relative w-full max-w-[325px] h-[400px] rounded-[8px] overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.160784)]">
            <img src={trends[1].image} alt={trends[1].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] to-transparent rounded-[8px]" />
            <div className="absolute top-[21px] right-[49px] w-[65px] h-[65px] rounded-full bg-gradient-to-r from-[#FF6A00] to-[#EE0979] shadow-[0px_0px_7.5px_rgba(0,0,0,0.25)] flex items-center justify-center">
              <img src="/_ionicons_svg_ios-flash.png" alt="" className="w-[21px] h-[36px] object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <div className="px-[45px] pb-4">
                <h2 className="text-[36px] font-bold leading-[54px] text-white font-['Poppins']">{trends[1].title}</h2>
                <p className="text-[15px] font-bold leading-[22px] text-white font-['Poppins']">{trends[1].hashtags}</p>
              </div>
              <div className="px-[49px] pb-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {(trends[1].avatars || []).slice(0, 3).map((avatar, i) => (
                    <img key={i} src={avatar} alt="" className="w-[30px] h-[30px] rounded-full object-cover shadow-[0px_0px_7.5px_rgba(0,0,0,0.75)]" />
                  ))}
                </div>
                <p className="text-[12px] font-bold leading-[18px] text-white font-['Poppins']">{trends[1].engagement}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
