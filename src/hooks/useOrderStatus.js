"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * useOrderStatus — SWR hook that polls an order's status every 5 seconds.
 *
 * The server endpoint (/api/orders/[id]) verifies that the signed-in customer
 * owns the order on every request. A cached response is never used to bypass
 * authorization — SWR always revalidates from the server.
 *
 * @param {string|null} orderId - The order ID to track, or null to skip
 * @param {Object} [options]
 * @param {Object} [options.fallbackData] - Pre-fetched order data from the server for instant first render
 * @returns {import("swr").SWRResponse} SWR response containing { data, error, isLoading, isValidating, mutate }
 */
export function useOrderStatus(orderId, { fallbackData } = {}) {
  return useSWR(
    orderId ? `/api/orders/${orderId}` : null,
    fetcher,
    {
      refreshInterval: 0,            // Disable continuous polling so cache is utilized
      revalidateOnFocus: false,      // Don't re-fetch on window focus
      dedupingInterval: 60_000,      // Suppress duplicate requests within 60 seconds
      revalidateIfStale: false,      // Serve cached status without background re-fetch
      revalidateOnReconnect: false,  // Don't re-fetch on network reconnect
      revalidateOnMount: false,      // Use cached/fallback data immediately
      fallbackData,
    }
  );
}
