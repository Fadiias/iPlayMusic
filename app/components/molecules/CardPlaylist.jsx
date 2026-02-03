"use client";

import { CoverImage } from '../atoms/Image';
import { Body, Caption } from '../atoms/Label';

export function CardPlaylist({ cover, title, subtitle, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-(--color-bg-alt) rounded-(--radius-card) cursor-pointer transition-colors"
    >
      <CoverImage src={cover} alt={title} size="md" />
      <div className="flex-1 min-w-0">
        <Body className="font-medium truncate">{title}</Body>
        <Caption className="truncate">{subtitle}</Caption>
      </div>
      <button 
        onClick={(e) => e.stopPropagation()}
        className="p-2 hover:bg-(--color-border) rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-(--color-text-secondary)" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  );
}

export function CardPlaylistSmall({ cover, title, subtitle, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="shrink-0 w-32 cursor-pointer group"
    >
      <CoverImage src={cover} alt={title} size="full" className="w-32 h-32 group-hover:opacity-80 transition-opacity" />
      <Body className="font-medium truncate mt-2">{title}</Body>
      <Caption className="truncate">{subtitle}</Caption>
    </div>
  );
}
