"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../components/organisms/BottomNav";
import SearchInput from "./SearchInput";
import { CardAlbum } from "../components/molecules/CardAlbum";

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-(--color-bg-alt) hover:bg-(--color-border) transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}

export default function FeaturedPageClient() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const featuredItems = useMemo(
    () => [
      {
        id: "tgs-1",
        title: "The Greatest Showman",
        subtitle: "Soundtrack",
        cover:
          "https://i.scdn.co/image/ab67616d0000b2739e1f7f4f7e7d26c7c0b2e3c3",
      },
      {
        id: "tgs-2",
        title: "Rewrite The Stars",
        subtitle: "Zac Efron, Zendaya",
        cover:
          "https://i.scdn.co/image/ab67616d0000b2739e1f7f4f7e7d26c7c0b2e3c3",
      },
      {
        id: "tgs-3",
        title: "This Is Me",
        subtitle: "Keala Settle",
        cover:
          "https://i.scdn.co/image/ab67616d0000b2739e1f7f4f7e7d26c7c0b2e3c3",
      },
      {
        id: "tgs-4",
        title: "A Million Dreams",
        subtitle: "The Greatest Showman",
        cover:
          "https://i.scdn.co/image/ab67616d0000b2739e1f7f4f7e7d26c7c0b2e3c3",
      },
      {
        id: "tgs-5",
        title: "Never Enough",
        subtitle: "Loren Allred",
        cover:
          "https://i.scdn.co/image/ab67616d0000b2739e1f7f4f7e7d26c7c0b2e3c3",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-(--color-bg) pb-32">
      <header className="max-w-md mx-auto px-6 pt-10">
        <div className="flex items-center justify-between">
          <IconButton
            label="Back"
            onClick={() => {
              try {
                router.back();
              } catch {
                router.push("/");
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </IconButton>

          <div className="text-(--color-text-secondary) font-semibold tracking-[0.25em] text-[12px]">
            FEATURED
          </div>

          <IconButton
            label={showSearch ? "Close search" : "Open search"}
            onClick={() => setShowSearch((s) => !s)}
          >
            {showSearch ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 18 18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </IconButton>
        </div>

        <div className="mt-8">
          <h1 className="text-[40px] leading-[1.05] font-bold">
            <span className="bg-linear-to-r from-[#FF6A00] to-[#FF1168] bg-clip-text text-transparent">
              Featured
            </span>
          </h1>
        </div>

        {showSearch ? (
          <div className="mt-5">
            <SearchInput />
          </div>
        ) : null}
      </header>

      <main className="max-w-md mx-auto px-6">
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-(--color-text-primary) text-[16px] font-semibold">Top picks</h2>
            <button
              type="button"
              className="text-(--color-text-secondary) text-[12px] font-semibold tracking-[0.18em]"
            >
              SEE ALL
            </button>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {featuredItems.slice(0, 4).map((it) => (
              <CardAlbum
                key={it.id}
                cover={it.cover}
                title={it.title}
                subtitle={it.subtitle}
                onClick={() => router.push("/")}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-(--color-text-primary) text-[16px] font-semibold">Just for you</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {featuredItems.slice(0, 4).map((it) => (
              <div
                key={`${it.id}-grid`}
                className="rounded-(--radius-card) border border-(--color-border) bg-(--color-bg) shadow-[0_16px_50px_rgba(0,0,0,0.08)] p-3"
                role="button"
                tabIndex={0}
                onClick={() => router.push("/")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") router.push("/");
                }}
              >
                <div className="w-full aspect-square rounded-(--radius-button) overflow-hidden bg-(--color-bg-alt)">
                  <img src={it.cover} alt={it.title} className="w-full h-full object-cover" />
                </div>
                <div className="mt-3 text-(--color-text-primary) text-[13px] font-semibold truncate">
                  {it.title}
                </div>
                <div className="text-(--color-text-secondary) text-[12px] truncate">{it.subtitle}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
