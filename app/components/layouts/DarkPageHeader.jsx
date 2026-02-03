"use client";

import { useRouter } from "next/navigation";

export function DarkPageHeader({
  title,
  titleGradient,
  showBack = true,
  onBack,
  onSearch,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <div className="bg-white dark:bg-[#341931] px-[25px] pt-[30px] pb-4 flex items-center justify-between transition-colors duration-200">
      {showBack ? (
        <button
          onClick={handleBack}
          className="w-9 h-6 flex items-center justify-center text-gray-900 dark:text-white"
          aria-label="Back"
        >
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" className="stroke-current">
            <path d="M8 1L1 7.5L8 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-9" />
      )}

      <h1 className="text-[15px] font-light leading-[22px] text-gray-900 dark:text-white uppercase tracking-wider">
        {title}
      </h1>

      <button
        onClick={onSearch || (() => router.push("/search"))}
        className="w-6 h-6 flex items-center justify-center text-gray-900 dark:text-white"
        aria-label="Search"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="stroke-current">
          <circle cx="6.5" cy="6.5" r="5.5" strokeWidth="2" />
          <path d="M10 10l4 4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function DarkPageTitle({ children, gradientPart, solidPart }) {
  return (
    <h1 className="text-[36px] font-bold leading-[54px] text-center">
      {gradientPart && (
        <span className="bg-gradient-to-r from-[#FF6A00] to-[#EE0979] bg-clip-text text-transparent">
          {gradientPart}
        </span>
      )}
      {gradientPart && solidPart && " "}
      {solidPart && <span className="text-[#FF1168]">{solidPart}</span>}
      {!gradientPart && !solidPart && children}
    </h1>
  );
}
