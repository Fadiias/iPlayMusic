"use client";

export function TextField({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error,
  showToggle = false,
  onToggle,
  showPassword = false,
  autoComplete,
  className = "" 
}) {
  // Determine autocomplete value based on type if not provided
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (type === "email") return "email";
    if (type === "password") return "current-password";
    return "off";
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-(--color-text-primary) text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showToggle && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={getAutoComplete()}
          className={`
            w-full px-4 py-3 bg-(--color-bg-alt) border
            ${error ? "border-(--color-error)" : "border-(--color-border)"}
            rounded-(--radius-card) text-(--color-text-primary)
            placeholder:text-(--color-text-secondary)
            focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent
            transition-all
          `}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary) text-sm font-medium hover:text-(--color-primary)"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-(--color-error) text-sm">{error}</p>
      )}
    </div>
  );
}

export function SearchField({ placeholder = "Search...", value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-text-secondary)"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full pl-10 pr-4 py-3 bg-(--color-bg-alt) border border-(--color-border)
          rounded-(--radius-card) text-(--color-text-primary)
          placeholder:text-(--color-text-secondary)
          focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent
          transition-all
        "
      />
    </div>
  );
}
