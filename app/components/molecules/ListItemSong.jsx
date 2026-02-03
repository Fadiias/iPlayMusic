"use client";

import { CoverImage } from '../atoms/Image';
import { Body, Caption } from '../atoms/Label';

export function ListItemSong({ cover, title, artist, album, duration, onClick, onMenuClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-(--color-bg-alt) rounded-(--radius-card) cursor-pointer transition-colors"
    >
      <CoverImage src={cover} alt={title} size="sm" />
      <div className="flex-1 min-w-0">
        <Body className="font-medium truncate">{title}</Body>
        <Caption className="truncate">{artist}{album && ` · ${album}`}</Caption>
      </div>
      {duration && (
        <Caption className="mr-2">{duration}</Caption>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); onMenuClick?.(); }}
        className="p-2 hover:bg-(--color-border) rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-(--color-text-secondary)" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  );
}

export function ListItemTrack({ number, title, duration, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 py-3 px-2 hover:bg-(--color-bg-alt) rounded-(--radius-card) cursor-pointer transition-colors"
    >
      <Caption className="w-6 text-center">{number}</Caption>
      <Body className="flex-1 truncate">{title}</Body>
      <Caption>{duration}</Caption>
    </div>
  );
}
