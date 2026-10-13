"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * useMenuSearch — SWR hook that caches each search term under a separate key.
 *
 * Example cache keys:
 *   /api/dishes?search=pizza
 *   /api/dishes?search=burger
 *
 * When the customer searches for "pizza" again, SWR reuses the cached result
 * and silently revalidates in the background.
 *
 * IMPORTANT: This hook does NOT debounce typing. Combine it with a debounced
 * search value (e.g. useDebounce from @/lib/useDebounce) to avoid a request
 * on every keystroke.
 *
 * @param {string} search - The current search term (should be pre-debounced)
 * @param {Object} [options]
 * @param {string} [options.category] - Optional category filter applied alongside search
 * @returns {import("swr").SWRResponse} SWR response containing { data, error, isLoading, isValidating, mutate }
 */
export function useMenuSearch(search, { category } = {}) {
  const query = (search || "").trim();

  // Build the cache key — null key tells SWR to skip the request entirely
  let url = null;
  if (query) {
    const params = new URLSearchParams();
    params.set("search", query);
    if (category && category !== "all") {
      params.set("category", category);
    }
    url = `/api/dishes?${params.toString()}`;
  }

  return useSWR(url, fetcher, {
    dedupingInterval: 300_000,     // Cache each search term for 5 minutes (serve from memory)
    keepPreviousData: true,        // Keep previous results visible while fetching new queries
    revalidateIfStale: false,      // Serve cached query results without background re-fetch
    revalidateOnFocus: false,      // Don't re-fetch on window focus
    revalidateOnReconnect: false,  // Don't re-fetch on network reconnect
  });
}
