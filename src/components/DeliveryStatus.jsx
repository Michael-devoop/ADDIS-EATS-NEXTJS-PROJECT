"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatCurrency,
  formatETB,
  formatDateTime,
  formatOrderStatus,
  formatAddress,
  formatEta,
  formatPhoneNumber,
} from "@/lib/format";

/**
 * Live Delivery Status Component
 * - Subscribes to Server-Sent Events (SSE) stream (/api/orders/[orderId]/stream)
 * - Seeded initially from server render for instant zero-layout-shift display
 * - Every value formatted through the shared @/lib/format module
 *
 * @param {Object} props
 * @param {string} props.orderId
 * @param {Object} props.initialOrder - Seeded order from server render
 * @param {Function} props.onTelemetryUpdate - Callback when courier position updates
 */
export default function DeliveryStatus({
  orderId,
  initialOrder = null,
  onTelemetryUpdate = null,
}) {
  const [order, setOrder] = useState(initialOrder);
  const [telemetry, setTelemetry] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connected" | "connecting" | "completed" | "error"
  const [lastPing, setLastPing] = useState(new Date());

  // Keep a stable ref to onTelemetryUpdate so changing function references do NOT restart the SSE stream
  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    onTelemetryUpdateRef.current = onTelemetryUpdate;
  }, [onTelemetryUpdate]);

  useEffect(() => {
    if (!orderId) return;

    // Connect to Server-Sent Events endpoint once per orderId
    const eventSource = new EventSource(`/api/orders/${orderId}/stream`);

    eventSource.addEventListener("initial", (e) => {
      try {
        const data = JSON.parse(e.data);
        setTelemetry(data);
        setConnectionStatus("connected");
        setLastPing(new Date());
        if (onTelemetryUpdateRef.current) {
          onTelemetryUpdateRef.current(data);
        }
      } catch (err) {
        console.error("Error parsing initial SSE telemetry:", err);
      }
    });

    eventSource.addEventListener("update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setTelemetry((prev) => ({ ...prev, ...data }));
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
        setConnectionStatus("connected");
        setLastPing(new Date());
        if (onTelemetryUpdateRef.current) {
          onTelemetryUpdateRef.current(data);
        }
      } catch (err) {
        console.error("Error parsing SSE telemetry update:", err);
      }
    });

    eventSource.addEventListener("completed", () => {
      setConnectionStatus("completed");
      setOrder((prev) => (prev ? { ...prev, status: "Delivered" } : prev));
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.warn("SSE connection interrupted, using server-seeded state:", err);
      setConnectionStatus("offline");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  const activeStatus = telemetry?.status || order?.status || "Out for Delivery";
  const statusInfo = formatOrderStatus(activeStatus);
  const progressPercent = telemetry?.progress ?? (activeStatus.toLowerCase() === "delivered" ? 100 : 65);
  const etaDisplay = formatEta(telemetry?.etaMinutes ?? order?.estimatedDeliveryMinutes ?? "12-18");

  const courier = telemetry?.courier || {
    name: "Kidus Tadesse",
    phone: "+251 91 199 8877",
    vehicle: "TVS Motorbike (Plate: AA-3-48291)",
    rating: 4.9,
    photo: "/images/service-1.jpg",
  };

  const steps = [
    { key: "pending", label: "Confirmed", icon: "✓" },
    { key: "preparing", label: "Kitchen", icon: "🍳" },
    { key: "out for delivery", label: "On the Way", icon: "🛵" },
    { key: "delivered", label: "Delivered", icon: "🏠" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
      {/* Top Header: Order ID & Live Stream Pulse Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading font-black text-xl text-[#111827]">
              Order #{orderId}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.badgeClass}`}
            >
              <span>{statusInfo.icon}</span>
              <span>{statusInfo.label}</span>
            </span>
          </div>
          <p className="text-xs text-[#6b7280] mt-1">
            Placed on {formatDateTime(order?.createdAt)}
          </p>
        </div>

        {/* Live SSE Telemetry Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`flex h-2.5 w-2.5 rounded-full ${
              connectionStatus === "connected"
                ? "bg-emerald-500 animate-ping"
                : connectionStatus === "completed"
                ? "bg-emerald-600"
                : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-bold text-gray-500">
            {connectionStatus === "connected"
              ? "Live GPS Telemetry (SSE)"
              : connectionStatus === "completed"
              ? "Delivery Completed"
              : "Connecting Stream..."}
          </span>
        </div>
      </div>

      {/* ETA & Progress Bar */}
      <div className="bg-[#fef8f6] rounded-2xl p-5 border border-orange-100/70 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f95738]">
              Estimated Arrival
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#111827]">
              {etaDisplay}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-400">Route Progress</span>
            <p className="text-lg font-black text-[#f95738]">{progressPercent}%</p>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full bg-orange-200/50 h-2.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="bg-[#f95738] h-full rounded-full transition-all duration-700 ease-out"
          />
        </div>
      </div>

      {/* 4-Step Visual Timeline */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        {steps.map((st, idx) => {
          const isDone = progressPercent >= (idx + 1) * 25 || statusInfo.stepIndex > idx + 1;
          const isCurrent = statusInfo.stepIndex === idx + 1;

          return (
            <div key={st.key} className="text-center space-y-1.5">
              <div
                className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#f95738] text-white shadow-md shadow-[#f95738]/30 animate-bounce"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {st.icon}
              </div>
              <span className="block text-[11px] font-bold text-[#111827] truncate">
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Courier Profile & Delivery Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Courier Info Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-orange-100 shrink-0 flex items-center justify-center text-2xl">
            🛵
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#111827] truncate">
                {courier.name}
              </span>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                ★ {courier.rating}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{courier.vehicle}</p>
            <p className="text-[11px] font-mono text-[#f95738] font-bold mt-0.5">
              {formatPhoneNumber(courier.phone)}
            </p>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-2xl shrink-0">
            📍
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Delivering To
            </span>
            <p className="font-bold text-xs text-[#111827] truncate mt-0.5">
              {formatAddress(order?.customer)}
            </p>
            {order?.customer?.orderNotes && (
              <p className="text-[11px] text-gray-500 italic truncate mt-0.5">
                &ldquo;{order.customer.orderNotes}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Pricing Summary Formatted via format.js */}
      {order?.pricing && (
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs border border-gray-100">
          <span className="text-gray-500">
            Items ({order.items?.length || 0}) · Payment:{" "}
            <strong>{order.paymentMethod || "Telebirr"}</strong>
          </span>
          <div className="text-right">
            <span className="font-black text-sm text-[#111827]">
              {formatCurrency(order.pricing.total)}
            </span>
            <span className="text-gray-400 ml-2 font-mono">
              ({formatETB(order.pricing.total)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
