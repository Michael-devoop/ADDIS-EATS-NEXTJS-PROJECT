"use client";

import { useEffect, useRef } from "react";
import { getStoredOrders, syncOrdersToLocalStorage } from "@/lib/orderStorage";

/**
 * OrderStorageSync runs once on client initialization to ensure orders
 * in localStorage are populated without firing redundant network requests.
 */
export default function OrderStorageSync() {
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    // If localStorage already has orders, do not trigger a server request
    const existing = getStoredOrders();
    if (existing && existing.length > 0) {
      return;
    }

    // Only attempt fetch if user is authenticated (session_id cookie is present)
    const hasSession =
      typeof document !== "undefined" &&
      document.cookie.split(";").some((c) => c.trim().startsWith("session_id="));

    if (!hasSession) {
      return;
    }

    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.success && Array.isArray(data?.orders) && data.orders.length > 0) {
          syncOrdersToLocalStorage(data.orders);
        }
      })
      .catch(() => {
        // Ignored if offline or unauthenticated guest session
      });
  }, []);

  return null;
}
