"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#341931] flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <div className="w-[200px] h-[210px] relative mb-8 flex items-center justify-center">
        <img src="/Group%20434.png" alt="iPlayMusic" className="w-full h-full object-contain" />
      </div>

      <h1 className="text-[32px] font-bold leading-[48px] text-white text-center mb-8">
        iPlayMusic
      </h1>

      <button
        onClick={() => router.push("/walkthrough")}
        className="w-full max-w-[325px] h-[60px] rounded-[50px] bg-gradient-to-r from-[#FF6A00] to-[#EE0979] text-white font-bold text-[15px] hover:opacity-90 transition-opacity"
      >
        Get Started
      </button>

      <button
        onClick={() => router.push("/login")}
        className="mt-4 text-white/70 font-light text-[15px] hover:text-white transition-colors"
      >
        I already have an account
      </button>

      <div className="mt-8 flex gap-6">
        <button onClick={() => router.push("/feed")} className="text-white/50 text-sm hover:text-white">Trends</button>
        <button onClick={() => router.push("/events-feed")} className="text-white/50 text-sm hover:text-white">Events</button>
        <button onClick={() => router.push("/categories")} className="text-white/50 text-sm hover:text-white">Categories</button>
        <button onClick={() => router.push("/featured")} className="text-white/50 text-sm hover:text-white">Featured</button>
        <button onClick={() => router.push("/albums")} className="text-white/50 text-sm hover:text-white">Albums</button>
      </div>
    </div>
  );
}
