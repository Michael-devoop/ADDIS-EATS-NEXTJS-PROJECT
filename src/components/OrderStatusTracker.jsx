"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import {
  saveOrderToLocalStorage,
  getStoredOrderById,
  syncOrdersToLocalStorage,
} from "@/lib/orderStorage";

const STATUS_STEPS = [
  {
    key: "Confirmed",
    title: "Order Confirmed",
    desc: "Order received & verified on the server",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "Preparing",
    title: "Preparing in Kitchen",
    desc: "Chefs are freshly cooking & packing dishes",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343a7.975 7.975 0 012.344 5.657c0 2.12-.823 4.122-2.343 5.657z"
        />
      </svg>
    ),
  },
  {
    key: "Out for Delivery",
    title: "Out for Delivery",
    desc: "Express courier is on the way to your door",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    key: "Delivered",
    title: "Delivered",
    desc: "Delivered safely. Enjoy your meal!",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

export default function OrderStatusTracker({
  initialOrderId,
  initialOrder,
  userOrders = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");

  const effectiveOrderId =
    queryOrderId || initialOrderId || userOrders[0]?.orderId || null;
  const [localFallbackOrder, setLocalFallbackOrder] = useState(() => {
    if (typeof window !== "undefined" && effectiveOrderId) {
      return getStoredOrderById(effectiveOrderId) || null;
    }
    return null;
  });
  const [inputOrderId, setInputOrderId] = useState("");

  // Sync server preloaded orders into localStorage
  useEffect(() => {
    if (userOrders && userOrders.length > 0) {
      syncOrdersToLocalStorage(userOrders);
    }
    if (initialOrder) {
      saveOrderToLocalStorage(initialOrder);
    }
  }, [userOrders, initialOrder]);

  // Listen for storage updates to keep local fallback in sync without cascading renders
  useEffect(() => {
    const handleUpdate = () => {
      if (effectiveOrderId) {
        setLocalFallbackOrder(getStoredOrderById(effectiveOrderId) || null);
      }
    };
    window.addEventListener("ordersUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ordersUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [effectiveOrderId]);

  // Preloaded order matches target ID -> used as instant fallbackData
  const hasMatchingInitialOrder =
    initialOrder &&
    (!effectiveOrderId ||
      initialOrder.orderId?.toUpperCase() === effectiveOrderId.toUpperCase());

  // Centralized SWR hook: polls every 5s, dedupes within 2s, revalidates on focus
  const { data, error, isLoading } = useOrderStatus(effectiveOrderId, {
    fallbackData: hasMatchingInitialOrder
      ? { success: true, order: initialOrder }
      : undefined,
  });

  // Whenever fresh data arrives from SWR, persist it immediately to localStorage
  useEffect(() => {
    if (data?.order) {
      saveOrderToLocalStorage(data.order);
    }
  }, [data?.order]);

  const fallbackFromStorage =
    !localFallbackOrder && typeof window !== "undefined" && effectiveOrderId
      ? getStoredOrderById(effectiveOrderId)
      : null;

  const order =
    data?.order ||
    (hasMatchingInitialOrder ? initialOrder : null) ||
    localFallbackOrder ||
    fallbackFromStorage;

  // Handle switching order
  const handleLookup = (e) => {
    e.preventDefault();
    if (!inputOrderId.trim()) return;
    const cleanId = inputOrderId.trim().toUpperCase();
    router.replace(`/order-status?orderId=${cleanId}`);
    setInputOrderId("");
  };

  // Calculate current progress step
  const currentStatus = order?.status || "Confirmed";
  const isCancelled = currentStatus === "Cancelled";
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressPercent = isCancelled
    ? 100
    : Math.round(((activeIndex + 1) / STATUS_STEPS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Order ID Switcher & Quick Selector */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9196]">
            My Orders:
          </span>
          {userOrders && userOrders.length > 0 ? (
            userOrders.slice(0, 4).map((o) => (
              <button
                key={o.orderId}
                type="button"
                onClick={() => {
                  router.replace(`/order-status?orderId=${o.orderId}`);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition ${
                  effectiveOrderId === o.orderId
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-[#6b6f72] hover:bg-gray-200"
                }`}
              >
                {o.orderId}
              </button>
            ))
          ) : (
            <span className="text-xs text-[#8c9196] italic">None placed yet</span>
          )}
        </div>

        {/* Custom Order ID Search Form */}
        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <input
            type="text"
            value={inputOrderId}
            onChange={(e) => setInputOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. ORD-123456)"
            className="w-56 rounded-lg border border-gray-200 px-3 py-1.5 text-xs uppercase text-dark placeholder-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && !order && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-bold uppercase text-red-800">
            {error.status === 403
              ? "Access Denied (403)"
              : `Order Not Found (${error.status || 404})`}
          </h3>
          <p className="mt-1 text-xs text-red-600">
            {error.message || `No order matches ID '${effectiveOrderId}'. Please check the order number.`}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {userOrders && userOrders[0] && (
              <button
                type="button"
                onClick={() => {
                  router.replace(`/order-status?orderId=${userOrders[0].orderId}`);
                }}
                className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
              >
                Track My Order ({userOrders[0].orderId})
              </button>
            )}
            <Link
              href="/order-history"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-dark transition hover:bg-gray-50"
            >
              Browse Order History
            </Link>
          </div>
        </div>
      )}

      {/* Loading Skeleton - only shown if no order data is present */}
      {isLoading && !order && (
        <div className="animate-pulse space-y-6">
          <div className="h-44 rounded-2xl bg-gray-100" />
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      )}

      {/* Order Status Display */}
      {!isLoading && !error && order && (
        <div className="space-y-8">
          {/* Main Status Hero Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-[#fbfcfb] to-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9196]">
                    Order Tracking
                  </span>
                  <div className="mt-1 flex items-center gap-3">
                    <h2 className="font-heading text-2xl font-extrabold uppercase text-dark sm:text-3xl">
                      {order.orderId}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        isCancelled
                          ? "bg-red-100 text-red-800"
                          : currentStatus === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b6f72]">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {/* Estimated Delivery / Time Remaining */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center sm:text-right">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Estimated Arrival
                  </span>
                  <span className="font-heading text-2xl font-black text-dark">
                    {currentStatus === "Delivered"
                      ? "Delivered ✓"
                      : isCancelled
                      ? "Cancelled"
                      : `${order.estimatedDeliveryMinutes || "20-30"} mins`}
                  </span>
                  <span className="block text-[10px] text-[#8c9196]">
                    Addis Eats Express Delivery
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="mb-2 flex justify-between text-xs font-semibold text-[#8c9196]">
                  <span>Progress</span>
                  <span className="text-primary font-bold">{progressPercent}% Completed</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      isCancelled
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-primary to-[#ff9800]"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="p-6 sm:p-8">
              {isCancelled ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                  <h4 className="font-heading text-base font-bold uppercase">Order Has Been Cancelled</h4>
                  <p className="mt-1 text-xs">This order was cancelled and will not be prepared or delivered.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = activeIndex > idx;
                    const isCurrent = activeIndex === idx;
                    const isUpcoming = activeIndex < idx;

                    return (
                      <div
                        key={step.key}
                        className={`relative rounded-xl border p-5 transition ${
                          isCurrent
                            ? "border-primary bg-primary/5 shadow-sm"
                            : isCompleted
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-gray-100 bg-gray-50/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${
                              isCurrent
                                ? "bg-primary text-white ring-4 ring-primary/20"
                                : isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {isCompleted ? "✓" : step.icon}
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8c9196]">
                              Step 0{idx + 1}
                            </span>
                            <h4 className="font-heading text-sm font-bold uppercase text-dark">
                              {step.title}
                            </h4>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-[#6b6f72]">
                          {step.desc}
                        </p>
                        {isCurrent && (
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                            Current Stage
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Details: Courier & Itemized Summary */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Courier & Destination */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-dark mb-4">
                  Courier Information
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Image
                      src="/images/bike.png"
                      alt="Courier delivery motorcycle fleet icon"
                      width={44}
                      height={38}
                      sizes="44px"
                      className="object-contain"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-dark">Abebe Berhanu</h5>
                    <p className="text-xs text-[#6b6f72]">Addis Eats Motorbike Fleet #14</p>
                    <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Verified Courier • ★ 4.9
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8c9196]">Courier Contact:</span>
                    <span className="font-semibold text-dark">+251 91 100 2233</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8c9196]">Vehicle:</span>
                    <span className="font-semibold text-dark">Yamaha 125cc (Plate ET-3-4912)</span>
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-dark mb-4">
                  Delivery Destination
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#8c9196] block text-[11px] uppercase">Recipient:</span>
                    <span className="font-semibold text-dark">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8c9196] block text-[11px] uppercase">Address:</span>
                    <span className="text-[#6b6f72]">
                      {order.customer?.address}, {order.customer?.city}, {order.customer?.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8c9196] block text-[11px] uppercase">Phone:</span>
                    <span className="text-[#6b6f72]">{order.customer?.phone || "N/A"}</span>
                  </div>
                  {order.customer?.orderNotes && (
                    <div>
                      <span className="text-[#8c9196] block text-[11px] uppercase">Instructions:</span>
                      <p className="italic text-[#6b6f72] mt-0.5">
                        &ldquo;{order.customer.orderNotes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Order Breakdown */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-dark">
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <span className="text-xs text-[#8c9196]">
                    Payment: <strong className="uppercase text-dark">{order.paymentMethod?.replace?.("_", " ") || order.paymentMethod}</strong>
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={`${item.name} ordered dish thumbnail`}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="h-12 w-12 rounded-lg object-cover border border-gray-100"
                          />
                        )}
                        <div>
                          <span className="font-bold text-dark block text-sm">
                            {item.name}
                          </span>
                          <span className="text-[#8c9196] text-xs">
                            ${Number(item.price).toFixed(2)} × {item.qty}
                          </span>
                        </div>
                      </div>
                      <span className="font-heading font-extrabold text-dark text-sm">
                        ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#6b6f72]">
                    <span>Subtotal</span>
                    <span>${(order.pricing?.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6f72]">
                    <span>VAT / Tax (8%)</span>
                    <span>${(order.pricing?.taxAmount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6f72]">
                    <span>Express Delivery</span>
                    <span>
                      {order.pricing?.isFreeDelivery
                        ? "FREE"
                        : `$${(order.pricing?.deliveryFee ?? 4.0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200/80 pt-3 flex justify-between items-baseline">
                    <span className="font-heading text-sm font-bold uppercase text-dark">Total</span>
                    <div className="text-right">
                      <span className="font-heading text-xl font-extrabold text-primary">
                        ${(order.pricing?.total ?? 0).toFixed(2)}
                      </span>
                      <span className="block text-[11px] text-[#8c9196]">
                        ({order.pricing?.etbEquivalent ?? 0} ETB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
