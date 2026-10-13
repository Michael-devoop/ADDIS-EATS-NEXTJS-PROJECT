"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * useMenu — SWR hook for fetching the full dish list from /api/dishes.
 *
 * Caching Strategy:
 * 1. First visit: Fetches from API and caches in memory
 * 2. Subsequent visits: Instantly serves from cache
 * 3. Background refresh: Automatically revalidates every 5 minutes
 * 4. Stale-while-revalidate: Shows cached data while fetching fresh data
 *
 * SWR automatically deduplicates requests - multiple components using
 * the same hook will share the cache and only trigger one network request.
 *
 * @param {Object} [options]
 * @param {string} [options.category] - Filter by dish category (e.g. "starters", "main")
 * @param {number} [options.limit]    - Limit the number of results
 * @param {Object} [options.fallbackData] - Pre-fetched data from the server for instant rendering
 * @param {number} [options.refreshInterval] - Custom refresh interval in ms (default: 5 minutes)
 * @returns {import("swr").SWRResponse} SWR response containing { data, error, isLoading, isValidating, mutate }
 */
export function useMenu(endpointOrOptions = {}) {
  let url = "/api/dishes";
  let fallbackData;
  let customRefreshInterval;

  if (typeof endpointOrOptions === "string") {
    url = endpointOrOptions;
  } else if (endpointOrOptions && typeof endpointOrOptions === "object") {
    const { category, limit, fallbackData: fb, refreshInterval } = endpointOrOptions;
    fallbackData = fb;
    customRefreshInterval = refreshInterval;
    const params = new URLSearchParams();

    if (category && category !== "all") {
      params.set("category", category);
    }
    if (limit) {
      params.set("limit", String(limit));
    }

    const queryString = params.toString();
    url = `/api/dishes${queryString ? `?${queryString}` : ""}`;
  }

  return useSWR(url, fetcher, {
    // Deduplication window: within 2 seconds identical requests are merged
    dedupingInterval: 2000,
    
    // Revalidation Strategy (Stale-While-Revalidate)
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    
    // Background Refresh (Polling)
    refreshInterval: customRefreshInterval || 5 * 60 * 1000,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    
    // Error Retry
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    
    // Pre-populated data for initial SSR
    fallbackData,
    
    // Do not hold onto previous category items when switching tabs
    keepPreviousData: false,
  });
}
