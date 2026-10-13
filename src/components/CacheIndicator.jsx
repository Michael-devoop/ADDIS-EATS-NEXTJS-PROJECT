/**
 * Cache Indicator Component
 * 
 * Shows a subtle indicator when data is being refreshed in the background.
 * Can be toggled with environment variable for production.
 */

"use client";

export default function CacheIndicator({ isValidating, show = true }) {
  // Hide in production unless explicitly enabled
  const showIndicator = show && (
    process.env.NODE_ENV === 'development' || 
    process.env.NEXT_PUBLIC_SHOW_CACHE_INDICATOR === 'true'
  );

  if (!showIndicator || !isValidating) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 shadow-lg backdrop-blur-sm">
        <svg 
          className="h-3.5 w-3.5 animate-spin" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Updating menu...</span>
      </div>
    </div>
  );
}
