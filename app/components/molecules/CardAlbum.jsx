"use client";

import { CoverImage } from '../atoms/Image';
import { Body, Caption } from '../atoms/Label';

export function CardAlbum({ cover, title, subtitle, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="shrink-0 w-36 cursor-pointer group"
    >
      <CoverImage src={cover} alt={title} size="full" className="w-36 h-36 group-hover:opacity-80 transition-opacity" />
      <Body className="font-medium truncate mt-2">{title}</Body>
      <Caption className="truncate">{subtitle}</Caption>
    </div>
  );
}
