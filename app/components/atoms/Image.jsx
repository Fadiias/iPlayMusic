"use client";

export function Avatar({ src, alt = "", size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-(--color-bg-alt) shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-(--color-text-secondary)">
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
  );
}

export function CoverImage({ src, alt = "", size = "md", rounded = "card", className = "" }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
    "2xl": "w-48 h-48",
    full: "w-full aspect-square",
  };

  const roundedClasses = {
    none: "rounded-none",
    card: "rounded-(--radius-card)",
    pill: "rounded-(--radius-pill)",
  };

  return (
    <div className={`${sizeClasses[size]} ${roundedClasses[rounded]} overflow-hidden bg-(--color-bg-alt) shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-(--color-text-secondary)">
          <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      )}
    </div>
  );
}
