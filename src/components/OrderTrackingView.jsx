"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import DeliveryMap from "@/components/DeliveryMap";
import DeliveryStatus from "@/components/DeliveryStatus";
import ExportOrdersButton from "@/components/ExportOrdersButton";
import {
  formatCurrency,
  formatETB,
  formatDateTime,
  formatAddress,
  formatPhoneNumber,
} from "@/lib/format";

/**
 * Interactive Order Tracking View (Client Leaf)
 * Connects Leaflet DeliveryMap and live SSE DeliveryStatus together.
 * Seeded from server render for instant paint.
 */
export default function OrderTrackingView({
  orderId,
  initialOrder,
  userOrders = [],
}) {
  const [telemetry, setTelemetry] = useState(null);

  const handleTelemetryUpdate = useCallback((data) => {
    setTelemetry(data);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Action Bar with Back Link and CSV Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/order-history"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#f95738] transition"
          >
            <span>←</span>
            <span>Back to Order History</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-semibold text-gray-500">
            Tracking ID: <span className="font-mono font-bold text-dark">{orderId}</span>
          </span>
        </div>

        {/* CSV Export Button (Survives awkward data) */}
        <div className="flex items-center gap-2">
          <ExportOrdersButton
            orders={userOrders.length > 0 ? userOrders : [initialOrder]}
            filename={`addis-eats-order-${orderId}.csv`}
          />
        </div>
      </div>

      {/* Main 2-Column Grid: Map and Live SSE Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Leaflet Map (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-heading font-black text-lg text-[#111827]">
                Live Dispatch Map
              </h3>
              <p className="text-xs text-[#6b7280]">
                Real-time Leaflet telemetry showing courier GPS route to your address
              </p>
            </div>
          </div>

          <DeliveryMap telemetry={telemetry} order={initialOrder} />
        </div>

        {/* Right Column: Live Status Component via SSE (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <DeliveryStatus
            orderId={orderId}
            initialOrder={initialOrder}
            onTelemetryUpdate={handleTelemetryUpdate}
          />
        </div>
      </div>

      {/* Bottom Card: Order Items & Pricing Breakdown (Formatted through format.js) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-heading font-black text-lg text-[#111827]">
              Order Items & Pricing Receipt
            </h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Every value formatted through one shared formatting module
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            {formatDateTime(initialOrder.createdAt)}
          </span>
        </div>

        {/* Ordered Dishes List */}
        <div className="divide-y divide-gray-100">
          {(initialOrder.items || []).map((item, idx) => (
            <div
              key={idx}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 rounded-xl px-2 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image || "/images/menu-1.jpg"}
                    alt={item.name || "Dish"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#111827]">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Qty: <strong className="text-gray-700">{item.qty || 1}</strong> × {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-black text-xs text-[#111827]">
                  {formatCurrency((item.qty || 1) * item.price)}
                </span>
                <span className="block text-[10px] font-mono text-gray-400">
                  {formatETB((item.qty || 1) * item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Subtotal, Tax, Delivery & Grand Total */}
        <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(initialOrder.pricing?.subtotal || initialOrder.pricing?.total)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (8%)</span>
            <span>{formatCurrency(initialOrder.pricing?.tax || 3.44)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Fee</span>
            <span>{formatCurrency(initialOrder.pricing?.delivery || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-[#111827] pt-3 border-t border-gray-200">
            <span>Grand Total</span>
            <div className="text-right">
              <span className="text-base text-emerald-600">
                {formatCurrency(initialOrder.pricing?.total || 43.0)}
              </span>
              <span className="block text-xs font-mono font-medium text-gray-500">
                {formatETB(initialOrder.pricing?.total || 43.0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
