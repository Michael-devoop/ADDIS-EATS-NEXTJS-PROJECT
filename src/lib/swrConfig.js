/**
 * Global SWR Configuration
 * 
 * Defines caching strategy for the entire application.
 * Individual hooks can override these defaults.
 */

import { fetcher } from "./fetcher";

/**
 * Cache duration constants (in milliseconds)
 */
export const CACHE_DURATION = {
  // Menu data changes infrequently
  MENU: 5 * 60 * 1000,           // 5 minutes
  
  // Categories rarely change
  CATEGORIES: 10 * 60 * 1000,    // 10 minutes
  
  // User session data
  SESSION: 30 * 1000,            // 30 seconds
  
  // Orders update more frequently
  ORDERS: 2 * 60 * 1000,         // 2 minutes
  
  // Real-time data
  REALTIME: 10 * 1000,           // 10 seconds
  
  // Static data (rarely changes)
  STATIC: 60 * 60 * 1000,        // 1 hour
};

/**
 * Default SWR configuration for the application
 * Used in SWRProvider component
 */
export const swrConfig = {
  // Global fetcher
  fetcher,
  
  // Deduplication: Merge identical requests within this window
  dedupingInterval: 2000, // 2 seconds
  
  // Revalidation settings (when to refresh data)
  revalidateIfStale: true,        // Show cached data, then fetch in background if stale
  revalidateOnFocus: false,       // Don't refetch when window regains focus
  revalidateOnReconnect: true,    // Refetch when internet reconnects
  revalidateOnMount: true,        // Check for updates on component mount
  
  // Error handling
  shouldRetryOnError: true,       // Retry on error
  errorRetryCount: 3,             // Max retry attempts
  errorRetryInterval: 5000,       // Wait 5 seconds between retries
  
  // Keep previous data while loading new data (smooth UX)
  keepPreviousData: true,
  
  // Loading/Error state behavior
  loadingTimeout: 3000,           // Show loading state after 3 seconds
  
  // Optimistic UI support
  compare: (a, b) => {
    // Custom comparison to prevent unnecessary re-renders
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

/**
 * Menu-specific SWR configuration
 */
export const menuSwrConfig = {
  refreshInterval: CACHE_DURATION.MENU,
  dedupingInterval: 2000,
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  keepPreviousData: true,
  errorRetryCount: 3,
};

/**
 * Session-specific SWR configuration
 * More aggressive revalidation for auth state
 */
export const sessionSwrConfig = {
  refreshInterval: CACHE_DURATION.SESSION,
  dedupingInterval: 1000,
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: true,  // ✅ Check auth on focus
  revalidateOnReconnect: true,
  keepPreviousData: false,
  errorRetryCount: 1,
};

/**
 * Orders-specific SWR configuration
 */
export const ordersSwrConfig = {
  refreshInterval: CACHE_DURATION.ORDERS,
  dedupingInterval: 2000,
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  keepPreviousData: true,
  errorRetryCount: 3,
};

/**
 * Static data configuration
 * Very long cache, minimal revalidation
 */
export const staticSwrConfig = {
  refreshInterval: CACHE_DURATION.STATIC,
  dedupingInterval: 60000, // 1 minute
  revalidateIfStale: false,
  revalidateOnMount: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  keepPreviousData: true,
  errorRetryCount: 1,
};

/**
 * Helper function to create custom SWR config
 * @param {number} refreshInterval - How often to refresh in background (ms)
 * @param {Object} overrides - Additional config overrides
 */
export function createSwrConfig(refreshInterval, overrides = {}) {
  return {
    ...swrConfig,
    refreshInterval,
    ...overrides,
  };
}
