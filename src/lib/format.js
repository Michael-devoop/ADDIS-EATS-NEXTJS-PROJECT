/**
 * Shared Formatting Module (Addis Eats)
 * Ensures every value across the application is formatted consistently through one central module.
 */

// Exchange rate constant: 1 USD = 125.5 ETB
export const ETB_EXCHANGE_RATE = 125.5;

/**
 * Format currency in Ethiopian Birr (ETB)
 * @param {number|string} val
 * @returns {string} e.g. "8,371 ETB"
 */
export function formatCurrency(val) {
  const num = typeof val === "number" ? val : parseFloat(val) || 0;
  const etb = Math.round(num * ETB_EXCHANGE_RATE);
  return `${etb.toLocaleString("en-US")} ETB`;
}

/**
 * Format currency in Ethiopian Birr (ETB)
 * @param {number|string} usdAmount
 * @returns {string} e.g. "8,371 ETB"
 */
export function formatETB(usdAmount) {
  const num = typeof usdAmount === "number" ? usdAmount : parseFloat(usdAmount) || 0;
  const etb = Math.round(num * ETB_EXCHANGE_RATE);
  return `${etb.toLocaleString("en-US")} ETB`;
}

/**
 * Format currency in ETB
 * @param {number|string} usdAmount
 * @returns {string} e.g. "8,371 ETB"
 */
export function formatDualCurrency(usdAmount) {
  return formatETB(usdAmount);
}

/**
 * Format date to standard string (YYYY-MM-DD)
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatDate(input) {
  if (!input) return "N/A";
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return String(input);
  }
}

/**
 * Format timestamp with full date and time (YYYY-MM-DD HH:mm:ss)
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatDateTime(input) {
  if (!input) return "N/A";
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch {
    return String(input);
  }
}

/**
 * Format time only (HH:mm:ss)
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatTime(input) {
  if (!input) return "00:00:00";
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${min}:${ss}`;
  } catch {
    return String(input);
  }
}

/**
 * Format human-readable relative time (e.g. "3 mins ago", "just now")
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatRelativeTime(input) {
  if (!input) return "recently";
  try {
    const d = new Date(input);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return "just now";
    if (diffSec < 90) return "1 min ago";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 7200) return "1 hour ago";
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return formatDate(input);
  } catch {
    return String(input);
  }
}

/**
 * Normalize and format order status with colors, badge styling, and icons
 * @param {string} status
 * @returns {Object} { key, label, badgeClass, icon, stepIndex }
 */
export function formatOrderStatus(status) {
  const s = (status || "").toLowerCase().trim();

  switch (s) {
    case "pending":
      return {
        key: "pending",
        label: "Order Placed",
        badgeClass: "bg-orange-50 text-[#f95738] border border-orange-200",
        icon: "📋",
        stepIndex: 1,
        description: "Your order has been received by Addis Eats kitchen.",
      };
    case "preparing":
      return {
        key: "preparing",
        label: "Kitchen Preparing",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: "🍳",
        stepIndex: 2,
        description: "Our chefs are freshly crafting your dishes.",
      };
    case "out for delivery":
    case "served":
      return {
        key: "out for delivery",
        label: "Out for Delivery",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
        icon: "🛵",
        stepIndex: 3,
        description: "Courier is on the way to your delivery address.",
      };
    case "completed":
    case "delivered":
      return {
        key: "delivered",
        label: "Delivered",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: "✅",
        stepIndex: 4,
        description: "Order has been safely delivered. Enjoy your meal!",
      };
    case "cancelled":
      return {
        key: "cancelled",
        label: "Cancelled",
        badgeClass: "bg-red-50 text-red-700 border border-red-200",
        icon: "❌",
        stepIndex: 0,
        description: "This order was cancelled.",
      };
    default:
      return {
        key: "unknown",
        label: status || "Processing",
        badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
        icon: "⏳",
        stepIndex: 1,
        description: "Order status is updating.",
      };
  }
}

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "N/A";
  const cleaned = String(phone).trim();
  return cleaned;
}

/**
 * Format customer delivery address
 * @param {Object|string} customerOrAddress
 * @returns {string}
 */
export function formatAddress(customerOrAddress) {
  if (!customerOrAddress) return "Addis Ababa, Ethiopia";
  if (typeof customerOrAddress === "string") return customerOrAddress;

  const parts = [
    customerOrAddress.address,
    customerOrAddress.city || "Addis Ababa",
    customerOrAddress.country || "Ethiopia",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Addis Ababa, Ethiopia";
}

/**
 * Format distance in km or meters
 * @param {number} km
 * @returns {string} e.g. "2.4 km"
 */
export function formatDistance(km) {
  const num = typeof km === "number" ? km : parseFloat(km) || 0;
  if (num < 1) {
    return `${Math.round(num * 1000)} m`;
  }
  return `${num.toFixed(1)} km`;
}

/**
 * Format ETA in minutes
 * @param {number|string} minutes
 * @returns {string} e.g. "15 mins"
 */
export function formatEta(minutes) {
  if (!minutes) return "10-15 mins";
  const num = parseInt(minutes, 10);
  if (isNaN(num)) return String(minutes);
  if (num <= 1) return "Under 1 min";
  return `${num} mins`;
}

/**
 * Escape a string for RFC 4180 CSV compliance
 * Safely handles strings containing commas, quotes, newlines, and unicode.
 * @param {any} val
 * @returns {string}
 */
export function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, quote, newline, or carriage return, wrap in quotes and escape quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
