"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Custom Recharts Tooltip for Daily Order Volume
 */
function OrdersTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#111827] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-gray-700">
        <p className="font-bold text-gray-200">
          {data.day}, {data.date}
        </p>
        <p className="text-[#f95738] font-black text-sm">
          {data.orderCount} Total Orders
        </p>
        <p className="text-gray-300 text-[11px]">
          {data.completedCount ?? (data.orderCount - (data.pendingCount || 0))} Completed · {data.pendingCount || 0} Pending
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Client Leaf Component for Daily Order Volume using Recharts
 * - Heading: "Daily Order Volume"
 * - Unit: "Orders / day"
 * - Fixed height: strictly 280px
 * - Accessible HTML table beneath the chart
 * - Only receives summarised rows across the server boundary
 */
export default function DailyOrdersChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      aria-labelledby="orders-chart-heading"
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col space-y-5"
    >
      {/* Header with Heading & Explicit Unit */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3
            id="orders-chart-heading"
            className="font-heading font-black text-lg text-[#111827] tracking-tight"
          >
            Daily Order Volume
          </h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Server-aggregated breakdown of dining and takeout volume
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-[#f95738] border border-orange-200"
            aria-label="Unit: Orders / day"
          >
            Unit: Orders / day
          </span>
          <span className="text-xs text-gray-400 font-medium">
            (Daily completed & active)
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart with Fixed Height Container (280px) */}
      <div
        className="w-full h-[280px] flex items-center justify-center pt-2"
        role="region"
        aria-label="Daily Order Volume visual Recharts bar chart"
      >
        {!mounted ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            Rendering chart engine...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            No aggregated order volume records available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<OrdersTooltip />} />
              <Bar
                dataKey="orderCount"
                fill="#f95738"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Accessible HTML Table Beneath the Chart (table, caption, thead, th scope, tbody, th scope="row", td) */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Accessible HTML Table Beneath Chart (Order Volume by Date)
        </h4>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">
              Daily aggregated order count metrics in tabular format beneath the Recharts bar chart
            </caption>
            <thead className="bg-[#f9fafb] text-gray-600 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-bold">
                  Date
                </th>
                <th scope="col" className="px-4 py-2.5 font-bold">
                  Day
                </th>
                <th scope="col" className="px-4 py-2.5 font-bold text-center">
                  Total Orders
                </th>
                <th scope="col" className="px-4 py-2.5 font-bold text-center">
                  Completed / Served
                </th>
                <th scope="col" className="px-4 py-2.5 font-bold text-center">
                  Pending / In-Kitchen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((row) => (
                <tr key={row.date} className="hover:bg-gray-50/70 transition">
                  <th
                    scope="row"
                    className="px-4 py-2.5 font-mono font-semibold text-gray-900"
                  >
                    {row.date}
                  </th>
                  <td className="px-4 py-2.5 font-medium text-gray-600">
                    {row.day}
                  </td>
                  <td className="px-4 py-2.5 text-center font-black text-[#f95738]">
                    {row.orderCount}
                  </td>
                  <td className="px-4 py-2.5 text-center font-semibold text-emerald-600">
                    {row.completedCount ?? (row.orderCount - (row.pendingCount || 0))}
                  </td>
                  <td className="px-4 py-2.5 text-center font-semibold text-amber-600">
                    {row.pendingCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
