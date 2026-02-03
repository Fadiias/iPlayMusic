"use client";

import { useState } from "react";

export default function SearchInput() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative">
      <svg 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-text-secondary)" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="What do you want to listen to?"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-(--color-bg-alt) rounded-full text-(--color-text-primary) placeholder:text-(--color-text-secondary) outline-none focus:ring-2 focus:ring-(--color-primary)"
      />
    </div>
  );
}
