"use client";

export function ButtonPrimary({ children, onClick, disabled, className = "", fullWidth = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-(--color-primary) text-white font-semibold
        py-3 px-6 rounded-(--radius-pill)
        hover:bg-(--color-primary-dark) transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function ButtonSecondary({ children, onClick, disabled, className = "", fullWidth = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-transparent border-2 border-(--color-primary) text-(--color-primary)
        font-semibold py-3 px-6 rounded-(--radius-pill)
        hover:bg-(--color-primary) hover:text-white transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function ButtonText({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`
        text-(--color-text-secondary) font-medium
        py-2 px-4 hover:text-(--color-primary) transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon, onClick, className = "", size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        bg-(--color-bg-alt) hover:bg-(--color-border) transition-colors
        ${className}
      `}
    >
      {icon}
    </button>
  );
}
