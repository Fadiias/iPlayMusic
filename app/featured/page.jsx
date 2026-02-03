"use client";

import { useRouter } from "next/navigation";
import { DarkPageHeader } from "../components/layouts/DarkPageHeader";
import { BottomNav } from "../components/organisms/BottomNav";

const FEATURED_ITEMS = [
  {
    id: 1,
    title: "The Greatest Showman",
    subtitle: "Soundtrack",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  },
  {
    id: 2,
    title: "Live Concert Highlights",
    subtitle: "Various Artists",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
];

export default function FeaturedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#341931] pb-24 transition-colors duration-200">
      <DarkPageHeader title="Featured" />
      <div className="px-[25px] pt-4">
        <h1 className="text-[36px] font-bold leading-[54px] mb-8">
          <span className="text-[#FF1168]">Featu</span>
          <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">red</span>
        </h1>

        <div className="space-y-6">
          {FEATURED_ITEMS.map((item) => (
            <div
              key={item.id}
              className="relative h-[415px] rounded-[8px] overflow-hidden shadow-[0px_5px_12.5px_rgba(0,0,0,0.25)]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-11">
                <h2 className="text-white font-bold text-[32px] leading-[48px] mb-2">
                  {item.title}
                </h2>
                <p className="text-white font-light text-[12px] leading-[18px]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
