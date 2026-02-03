"use client";

import { Avatar } from '../atoms/Image';
import { Body, Caption } from '../atoms/Label';

export function ListItemArtist({ image, name, subtitle = "Artist", onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-(--color-bg-alt) rounded-(--radius-card) cursor-pointer transition-colors"
    >
      <Avatar src={image} alt={name} size="lg" />
      <div className="flex-1 min-w-0">
        <Body className="font-medium truncate">{name}</Body>
        <Caption>{subtitle}</Caption>
      </div>
      <svg className="w-5 h-5 text-(--color-text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
