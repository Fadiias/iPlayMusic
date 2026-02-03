"use client";

export function Title({ children, className = "" }) {
  return (
    <h1 className={`text-[28px] md:text-[32px] font-semibold text-(--color-text-primary) ${className}`}>
      {children}
    </h1>
  );
}

export function Heading({ children, className = "" }) {
  return (
    <h2 className={`text-[22px] md:text-[24px] font-semibold text-(--color-text-primary) ${className}`}>
      {children}
    </h2>
  );
}

export function Subheading({ children, className = "" }) {
  return (
    <h3 className={`text-[18px] md:text-[20px] font-medium text-(--color-text-primary) ${className}`}>
      {children}
    </h3>
  );
}

export function Body({ children, className = "" }) {
  return (
    <p className={`text-[14px] md:text-[16px] text-(--color-text-primary) ${className}`}>
      {children}
    </p>
  );
}

export function Caption({ children, className = "" }) {
  return (
    <span className={`text-[12px] md:text-[13px] text-(--color-text-secondary) ${className}`}>
      {children}
    </span>
  );
}
