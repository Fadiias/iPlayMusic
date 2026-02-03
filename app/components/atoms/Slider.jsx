"use client";

export function Slider({ value, max, onChange, className = "" }) {
  const percentage = (value / max) * 100;

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={onChange}
        className="
          w-full h-1 bg-(--color-border) rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-(--color-primary)
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125
        "
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${percentage}%, var(--color-border) ${percentage}%)`,
        }}
      />
    </div>
  );
}

export function ProgressBar({ value, max, className = "" }) {
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full h-1 bg-(--color-border) rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-(--color-primary) rounded-full transition-all duration-200"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
