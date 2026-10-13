"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  getStoredOrders,
  syncOrdersToLocalStorage,
  updateStoredOrderStatus,
} from "@/lib/orderStorage";
import ExportOrdersButton from "@/components/ExportOrdersButton";

const TIMELINE_STEPS = [
  { key: "ordered", label: "Ordered" },
  { key: "payment", label: "Payment" },
  { key: "confirmation", label: "Confirmation" },
  { key: "delivery", label: "Delivery" },
];

function formatDate(dateStr) {
  if (!dateStr) return "26/12/2024";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "26/12/2024";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculates step completion status (0 to 4 completed steps)
 * Step 1: Ordered
 * Step 2: Payment
 * Step 3: Confirmation
 * Step 4: Delivery
 */
function getStepStatus(status) {
  switch (status) {
    case "Delivered":
      return 4; // All 4 green
    case "Out for Delivery":
      return 3; // 1, 2, 3 green; 4 yellow/in-progress
    case "Preparing":
      return 2; // 1, 2 green; 3, 4 yellow
    case "Confirmed":
    default:
      return 2; // In Figma: Ordered & Payment are green, Confirmation & Delivery are yellow
  }
}

export default function OrderHistoryView({ initialOrders = [] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [localOrders, setLocalOrders] = useState(() => {
    if (typeof window !== "undefined") {
      return getStoredOrders();
    }
    return [];
  });

  // 1. Listen for reactive storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setLocalOrders(getStoredOrders());
    };
    window.addEventListener("ordersUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ordersUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Fetch orders with SWR
  // Using fallbackData from server preload guarantees instant rendering with zero spinner!
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/orders",
    fetcher,
    {
      fallbackData:
        initialOrders && initialOrders.length > 0
          ? { success: true, count: initialOrders.length, orders: initialOrders }
          : undefined,
      revalidateOnFocus: false,      // Don't re-fetch when user returns to tab
      revalidateIfStale: false,      // Serve cached data without background re-fetch
      revalidateOnMount: false,      // Don't re-fetch on mount if data exists
      refreshInterval: 0,           // No auto-polling for order history
      dedupingInterval: 300_000,    // Cache for 5 minutes
      revalidateOnReconnect: false,  // Don't re-fetch on network reconnect
    }
  );

  // 2. Synchronize incoming server orders into localStorage (dispatches ordersUpdated event)
  useEffect(() => {
    const incoming = data?.orders || initialOrders;
    if (incoming && incoming.length > 0) {
      syncOrdersToLocalStorage(incoming);
    }
  }, [data?.orders, initialOrders]);

  // Combine server orders with locally stored orders
  const serverOrders = data?.orders || initialOrders || [];
  const orderMap = new Map();
  for (const o of localOrders) {
    if (o?.orderId) orderMap.set(o.orderId.toUpperCase(), o);
  }
  for (const o of serverOrders) {
    if (o?.orderId) {
      const id = o.orderId.toUpperCase();
      const existing = orderMap.get(id);
      orderMap.set(id, existing ? { ...existing, ...o } : o);
    }
  }

  const orders =
    orderMap.size > 0
      ? Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
      : serverOrders;

  // Filter & Search
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === "all" ? true : order.status?.toLowerCase() === filter.toLowerCase();

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.orderId?.toLowerCase().includes(query) ||
      `${order.customer?.firstName} ${order.customer?.lastName}`
        .toLowerCase()
        .includes(query) ||
      order.items?.some((i) => i.name?.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${orderId}?`
    );
    if (!confirmed) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const json = await res.json();
      if (json.success) {
        updateStoredOrderStatus(orderId, "Cancelled");
        mutate();
      } else {
        alert(json.error || "Failed to cancel order");
      }
    } catch (err) {
      alert(err.message || "An error occurred while cancelling order.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filter and Search Bar ONLY (Metrics cards removed as requested) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Orders" },
            { id: "confirmed", label: "Confirmed" },
            { id: "preparing", label: "Preparing" },
            { id: "out for delivery", label: "Out for Delivery" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[44px] inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-[#6b6f72] hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input & live indicator */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter orders..."
              aria-label="Filter orders by ID or customer"
              className="min-h-[44px] w-full rounded-xl border border-gray-200 px-3.5 py-2 pl-9 text-xs text-dark placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            title="Refresh order history"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#6b6f72] transition hover:border-primary hover:text-primary"
          >
            <span className={isValidating ? "animate-spin" : ""}>↻</span>
          </button>

          <ExportOrdersButton orders={filteredOrders} />
        </div>
      </div>

      {/* Loading Skeleton - only shown if no orders are loaded */}
      {isLoading && orders.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between"
            >
              <div className="flex items-center gap-4 w-full lg:w-1/3">
                <div className="h-20 w-28 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-8 w-64 rounded bg-gray-100" />
              <div className="h-10 w-44 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 shadow-sm">
          <p className="font-semibold">Unable to load order history.</p>
          <p className="mt-1 text-xs text-red-600">
            {error.message || "An unexpected error occurred while fetching orders."}
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-bold uppercase text-dark">
            No Orders Found
          </h3>
          <p className="mt-1 text-xs text-[#6b6f72]">
            {search || filter !== "all"
              ? "No orders match the current filter criteria."
              : "You have not placed any orders yet."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/menu" className="button !py-2.5 !text-xs">
              Explore Our Menu
            </Link>
          </div>
        </div>
      )}

      {/* Orders List matching the provided Figma design */}
      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const firstItem = order.items?.[0] || {};
            const itemCount = order.items?.length || 1;
            const itemImage = firstItem.image || "/images/burgr1.png";
            const itemName =
              itemCount > 1
                ? `${firstItem.name || "Special Dish"} & ${itemCount - 1} more`
                : firstItem.name || "Special Dish";

            const itemDescription =
              order.customer?.orderNotes ||
              `Order ${order.orderId} • Delivered to ${order.customer?.address || "Addis Ababa"}`;

            const orderTotal = (order.pricing?.total ?? 0).toFixed(0);
            const dateStr = formatDate(order.createdAt);

            const isCancelled = order.status === "Cancelled";
            const completedStepCount = getStepStatus(order.status);

            return (
              <div
                key={order.orderId}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  {/* Left Section: Image + Title/Desc + Price */}
                  <div className="flex flex-1 items-center gap-4 sm:gap-6 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-28 sm:h-24 sm:w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm border border-gray-100">
                      <Image
                        src={itemImage}
                        alt={`${itemName} order record thumbnail`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 112px, 144px"
                      />
                    </div>

                    {/* Title & Description */}
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-heading font-semibold text-dark text-sm sm:text-base leading-snug line-clamp-1">
                        {itemName}
                      </h4>
                      <p className="mt-1 text-xs text-[#6b6f72] line-clamp-2 max-w-sm leading-relaxed">
                        {itemDescription}
                      </p>
                      <span className="mt-1 inline-block text-[11px] font-mono text-[#8c9196]">
                        #{order.orderId}
                      </span>
                    </div>

                    {/* Price: matching "150 $" style from Figma design */}
                    <div className="shrink-0 pl-2 pr-4 text-right">
                      <span className="font-heading text-lg sm:text-xl font-bold text-dark whitespace-nowrap">
                        {orderTotal} $
                      </span>
                    </div>
                  </div>

                  {/* Middle Section: 4-Step Horizontal Progress Tracker */}
                  <div className="w-full xl:w-[420px] 2xl:w-[460px] shrink-0 px-2 py-2">
                    {isCancelled ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Order Cancelled on {dateStr}
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Connecting Line between the 4 dots */}
                        <div className="absolute top-[7px] left-[12%] right-[12%] h-[3px] -translate-y-1/2 flex">
                          {/* Segment 1: Ordered -> Payment */}
                          <div
                            className={`h-full flex-1 transition-colors duration-500 ${
                              completedStepCount >= 2 ? "bg-[#10b981]" : "bg-[#f59e0b]"
                            }`}
                          />
                          {/* Segment 2: Payment -> Confirmation */}
                          <div
                            className={`h-full flex-1 transition-colors duration-500 ${
                              completedStepCount >= 3 ? "bg-[#10b981]" : "bg-[#f59e0b]"
                            }`}
                          />
                          {/* Segment 3: Confirmation -> Delivery */}
                          <div
                            className={`h-full flex-1 transition-colors duration-500 ${
                              completedStepCount >= 4 ? "bg-[#10b981]" : "bg-[#f59e0b]"
                            }`}
                          />
                        </div>

                        {/* 4 Dots & Labels */}
                        <div className="relative flex justify-between">
                          {TIMELINE_STEPS.map((step, idx) => {
                            const stepNumber = idx + 1;
                            const isGreen = completedStepCount >= stepNumber;
                            const dotColor = isGreen
                              ? "bg-[#10b981] ring-[#10b981]/20"
                              : "bg-[#f59e0b] ring-[#f59e0b]/20";

                            return (
                              <div
                                key={step.key}
                                className="flex flex-col items-center text-center w-20"
                              >
                                {/* Circular Dot */}
                                <div
                                  className={`h-3.5 w-3.5 rounded-full ring-4 shadow-sm z-10 transition-colors duration-500 ${dotColor}`}
                                />

                                {/* Step Label */}
                                <span className="mt-2 text-[11px] font-medium text-dark tracking-tight">
                                  {step.label}
                                </span>

                                {/* Date underneath */}
                                <span className="mt-0.5 text-[10px] text-[#8c9196] font-normal">
                                  {dateStr}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section: Action Buttons matching the Figma design */}
                  <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                    {/* Track Order Button */}
                    <Link
                      href={`/order-status/${order.orderId}`}
                      className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-dark shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
                    >
                      Track Order
                    </Link>

                    {/* Cancel Order Button */}
                    {isCancelled ? (
                      <span className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed">
                        Cancelled
                      </span>
                    ) : order.status === "Delivered" ? (
                      <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-2.5 text-xs font-semibold text-emerald-600">
                        Delivered ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={cancellingId === order.orderId}
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs font-semibold text-red-500 shadow-sm transition hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                      >
                        {cancellingId === order.orderId ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
