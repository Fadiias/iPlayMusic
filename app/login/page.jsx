"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const handleSpotifyLogin = () => {
    window.location.href = "/api/auth/login?next=/";
  };

  return (
    <div className="min-h-screen bg-[#FF1168] flex flex-col">
      {/* Header - Figma: Log In, 36px Bold white */}
      <div className="px-[25px] pt-[34px]">
        <h1 className="text-[36px] font-bold leading-[54px] text-white">
          Log In
        </h1>
      </div>

      {/* Content - Figma: Username, Password, LOG IN button, One-Touch */}
      <div className="flex-1 px-[25px] pt-16">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-white/20 border-2 border-white/50 rounded-lg">
            <p className="text-white text-sm font-medium">
              {error === "token_exchange_failed"
                ? "Failed to authenticate with Spotify. Please try again."
                : error === "config_error"
                ? "Server configuration error. Please check your setup."
                : "An error occurred. Please try again."}
            </p>
          </div>
        )}

        {/* Username - Figma */}
        <div className="mb-6">
          <label className="block text-white font-bold text-[15px] leading-[22px] mb-2">
            Username
          </label>
          <div className="relative border-b-[3px] border-white pb-2">
            <input
              type="text"
              placeholder="Enter you username"
              className="w-full bg-transparent text-white placeholder-white/70 font-light text-[15px] leading-[22px] outline-none pr-8"
            />
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-[21px] h-[21px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Password - Figma */}
        <div className="mb-8">
          <label className="block text-white font-bold text-[15px] leading-[22px] mb-2">
            Password
          </label>
          <div className="relative border-b-[3px] border-white pb-2">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-transparent text-white placeholder-white/70 font-light text-[15px] leading-[22px] outline-none pr-8"
            />
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-[21px] h-[21px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {/* LOG IN Button - triggers Spotify OAuth */}
        <button
          onClick={handleSpotifyLogin}
          className="w-full max-w-[325px] h-[60px] flex items-center justify-center
            border-[3px] border-white rounded-[50px] bg-transparent
            text-white font-bold text-[15px] leading-[22px] uppercase
            hover:bg-white/10 transition-colors"
        >
          LOG IN
        </button>

        {/* Fingerprint + One-Touch Login */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="w-[75px] h-[75px] rounded-full bg-white/25 flex items-center justify-center">
            <svg className="w-[30px] h-[30px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <p className="text-white font-light text-[15px] leading-[22px]">
            One-Touch Login
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FF1168]">
          <div className="text-white font-light">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
