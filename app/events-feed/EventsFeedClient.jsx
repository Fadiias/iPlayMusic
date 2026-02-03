"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DarkPageHeader } from "../components/layouts/DarkPageHeader";
import { BottomNav } from "../components/organisms/BottomNav";

export default function EventsFeedClient({ events = [], hashtags = ["#spotify", "#musicworld", "#newreleases", "#featured"], needsAuth = false }) {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState(null);

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
        <DarkPageHeader title="Events Feed" />
        <div className="px-[25px] pt-4 text-center py-12">
          <p className="text-white/90">Log in to Spotify to see events</p>
          <button onClick={() => router.push("/login")} className="mt-4 px-6 py-3 rounded-full bg-[#FF1168] text-white font-semibold">
            Log in to Spotify
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
      <DarkPageHeader title="Events Feed" />
      <div className="px-[25px] pt-4">
        <h1 className="text-[36px] font-bold leading-[54px] mb-6">
          <span className="text-[#FF6A00]">Events</span>{" "}
          <span className="text-[#FF1168]">Feed</span>
        </h1>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-[25px] px-[25px]">
          {hashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`shrink-0 px-5 py-2.5 rounded-[50px] font-bold text-[15px] transition-colors ${
                activeTag === tag ? "bg-[#FF6A00] text-white" : "bg-[#FF1168] text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-4 mt-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="bg-[#111625] rounded-[8px] overflow-hidden">
                <div className="relative h-[203px]">
                  <img src={event.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#111111] to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-[#FF1168] font-light text-[12px] mb-2">{event.hashtags}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-2 items-center gap-2">
                      {Array.isArray(event.avatars) && event.avatars.length > 0
                        ? event.avatars.slice(0, 3).map((avatar, i) =>
                            typeof avatar === "string" && avatar.startsWith("http") ? (
                              <img key={i} src={avatar} alt="" className="w-[30px] h-[30px] rounded-full border-2 border-[#111625] object-cover shrink-0" />
                            ) : (
                              <span key={i} className="w-[30px] h-[30px] rounded-full border-2 border-[#111625] bg-[#FF1168]/40 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {String(avatar).charAt(0).toUpperCase()}
                              </span>
                            )
                          )
                        : null}
                    </div>
                    <p className="text-white font-bold text-[12px]">{event.engagement}</p>
                  </div>
                  <h2 className="text-white font-bold text-[20px] leading-[30px]">{event.title}</h2>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-white/70">No new releases or featured content</div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
