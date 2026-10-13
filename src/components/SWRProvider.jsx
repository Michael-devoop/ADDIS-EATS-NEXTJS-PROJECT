"use client";

import { useEffect } from "react";
import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/swrConfig";

/**
 * Global SWR Provider with optimized caching configuration.
 * 
 * Caching Strategy:
 * - First load: Fetches data from API
 * - Cached: Serves from memory instantly on subsequent loads
 * - Background refresh: Automatically updates cache in background
 * - Stale-while-revalidate: Shows cached data while fetching updates
 * 
 * All components using useSWR with the same key share the cache.
 */
export default function SWRProvider({ children, value = {} }) {
  // Clean up any stale swr-cache key that might have corrupted session state
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("swr-cache");
      }
    } catch {}
  }, []);

  return (
    <SWRConfig
      value={{
        ...swrConfig,
        ...value, // Allow overrides from parent
      }}
    >
      {children}
    </SWRConfig>
  );
}

