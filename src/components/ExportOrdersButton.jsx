"use client";

import { useState } from "react";
import { formatCurrency, formatETB, formatDateTime, escapeCsvField } from "@/lib/format";

/**
 * Robust CSV Export Button for Order History
 * - Survives awkward data: commas, double quotes, line breaks, null/undefined fields,
 *   nested item arrays, unicode characters, and formula injection attempts.
 * - Adds UTF-8 BOM so Microsoft Excel handles international characters seamlessly.
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects to export
 * @param {string} props.filename - Optional custom filename
 */
export default function ExportOrdersButton({
  orders = [],
  filename = "addis-eats-order-history.csv",
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Order ID",
        "Date & Time",
        "Status",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Delivery Address",
        "Order Notes",
        "Payment Method",
        "Items Count",
        "Items Summary",
        "Subtotal (USD)",
        "Tax (USD)",
        "Delivery Fee (USD)",
        "Total (USD)",
        "Total (ETB)",
      ];

      const csvRows = [];
      csvRows.push(headers.map(escapeCsvField).join(","));

      orders.forEach((order) => {
        if (!order) return;

        // Awkward data safety sanitizers
        const orderId = order.orderId || order.id || "N/A";
        const dateStr = formatDateTime(order.createdAt || order.date);
        const status = order.status || "Pending";

        const customer = order.customer || {};
        const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer";
        const customerEmail = customer.email || order.ownerEmail || "";
        const customerPhone = customer.phone || "";
        const address = customer.address
          ? `${customer.address}, ${customer.city || "Addis Ababa"}`
          : order.tableNumber || "Pickup";
        const orderNotes = customer.orderNotes || order.notes || "";

        const payment = order.paymentMethod || "Telebirr";
        const items = Array.isArray(order.items) ? order.items : [];
        const itemsCount = items.reduce((sum, item) => sum + (Number(item?.qty) || 1), 0);

        // Summarize items into a single cell with proper internal formatting
        const itemsSummary = items
          .map((i) => `${i.qty || 1}x ${i.name || "Item"} ($${(i.price || 0).toFixed(2)})`)
          .join("; ");

        const pricing = order.pricing || {};
        const subtotal = formatCurrency(pricing.subtotal || pricing.total || 0);
        const tax = formatCurrency(pricing.tax || pricing.taxAmount || 0);
        const deliveryFee = formatCurrency(pricing.delivery || pricing.deliveryFee || 0);
        const totalUsd = formatCurrency(pricing.total || 0);
        const totalEtb = formatETB(pricing.total || 0);

        // Mitigate CSV Formula Injection: if a string begins with = + - @, prefix with a single quote
        const sanitizeFormula = (val) => {
          if (typeof val === "string" && /^[=+\-@\t\r]/.test(val)) {
            return `'${val}`;
          }
          return val;
        };

        const row = [
          sanitizeFormula(orderId),
          sanitizeFormula(dateStr),
          sanitizeFormula(status),
          sanitizeFormula(customerName),
          sanitizeFormula(customerEmail),
          sanitizeFormula(customerPhone),
          sanitizeFormula(address),
          sanitizeFormula(orderNotes),
          sanitizeFormula(payment),
          itemsCount,
          sanitizeFormula(itemsSummary),
          subtotal,
          tax,
          deliveryFee,
          totalUsd,
          totalEtb,
        ];

        csvRows.push(row.map(escapeCsvField).join(","));
      });

      // Prepend UTF-8 Byte Order Mark (BOM) so Excel decodes UTF-8 text properly
      const csvContent = "\uFEFF" + csvRows.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export orders CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || orders.length === 0}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:border-[#f95738] hover:text-[#f95738] hover:bg-[#fef8f6] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title="Export order history as sanitized CSV spreadsheet"
    >
      <span className="text-base">📥</span>
      <span>{isExporting ? "Generating CSV..." : "Export Order History (CSV)"}</span>
      <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-semibold">
        {orders.length}
      </span>
    </button>
  );
}
