"use client";

import { useRouter } from 'next/navigation';
import { Subheading } from '../atoms/Label';
import { IconButton } from '../atoms/Button';

export function TopBar({ title, showBack = false, rightAction, className = "" }) {
  const router = useRouter();

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-[#341931] transition-colors duration-200 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {title && <span className="text-gray-900 dark:text-white font-light text-[15px] uppercase tracking-wider">{title}</span>}
      </div>
      {rightAction && (
        <div>{rightAction}</div>
      )}
    </div>
  );
}
