// Persistent orders repository
// Stores orders in a local JSON file so they survive dev server restarts.
// Falls back to in-memory if the file can't be read/written.

import fs from "fs";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

const INITIAL_ORDERS = [
  {
    orderId: "ORD-930124",
    sessionId: "demo-session-1",
    ownerEmail: "demo@addiseats.com",
    items: [
      {
        id: "special-kitfo",
        name: "Special Kitfo Platter",
        price: 28.0,
        qty: 1,
        image: "/images/ktfo.png",
        categories: ["ethiopian"],
      },
      {
        id: "mixed-drink",
        name: "Mixed Drink",
        price: 7.0,
        qty: 2,
        image: "/images/herobg.png",
        categories: ["drinks"],
      },
    ],
    customer: {
      firstName: "Abebe",
      lastName: "Bikila",
      email: "demo@addiseats.com",
      phone: "+251911223344",
      address: "Bole Medhanialem, St. 4",
      city: "Addis Ababa",
      country: "Ethiopia",
      orderNotes: "Mitmita and extra kocho please",
    },
    paymentMethod: "telebirr",
    pricing: {
      subtotal: 42.0,
      discount: 0,
      taxRate: 0.08,
      taxAmount: 3.36,
      baseDeliveryFee: 4.0,
      isFreeDelivery: false,
      deliveryFee: 4.0,
      total: 49.36,
      etbExchangeRate: 125.5,
      etbEquivalent: "6194.68",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    status: "Preparing",
    estimatedDeliveryMinutes: "20-25",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    orderId: "ORD-841920",
    sessionId: "demo-session-2",
    ownerEmail: "selam@addiseats.com",
    items: [
      {
        id: "special-burger",
        name: "Special Burger",
        price: 18.5,
        qty: 2,
        image: "/images/burgr1.png",
        categories: ["burger"],
      },
    ],
    customer: {
      firstName: "Selamawit",
      lastName: "Kebede",
      email: "selam@addiseats.com",
      phone: "+251922334455",
      address: "Kazanchis, Guinea Conakry St",
      city: "Addis Ababa",
      country: "Ethiopia",
      orderNotes: "Ring bell upon arrival",
    },
    paymentMethod: "cbe_birr",
    pricing: {
      subtotal: 37.0,
      discount: 0,
      taxRate: 0.08,
      taxAmount: 2.96,
      baseDeliveryFee: 4.0,
      isFreeDelivery: false,
      deliveryFee: 4.0,
      total: 43.96,
      etbExchangeRate: 125.5,
      etbEquivalent: "5516.98",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    status: "Out for Delivery",
    estimatedDeliveryMinutes: "5-10",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    orderId: "ORD-519342",
    sessionId: "demo-session-3",
    ownerEmail: "dawit.m@example.com",
    items: [
      {
        id: "doro-wot",
        name: "Traditional Doro Wot",
        price: 24.0,
        qty: 1,
        image: "/images/dorowot1.png",
        categories: ["ethiopian"],
      },
    ],
    customer: {
      firstName: "Dawit",
      lastName: "Mengistu",
      email: "dawit.m@example.com",
      phone: "+251933445566",
      address: "Old Airport, Near Golf Club",
      city: "Addis Ababa",
      country: "Ethiopia",
      orderNotes: "Delivered to office reception",
    },
    paymentMethod: "telebirr",
    pricing: {
      subtotal: 24.0,
      discount: 0,
      taxRate: 0.08,
      taxAmount: 1.92,
      baseDeliveryFee: 4.0,
      isFreeDelivery: false,
      deliveryFee: 4.0,
      total: 29.92,
      etbExchangeRate: 125.5,
      etbEquivalent: "3754.96",
      calculatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    status: "Delivered",
    estimatedDeliveryMinutes: "0",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// File-based persistence helpers
// ---------------------------------------------------------------------------

/** Ensure the data/ directory exists */
function ensureDataDir() {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Read orders from the JSON file on disk */
function readOrdersFromFile() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[ordersStore] Could not read orders file, using defaults:", err.message);
  }
  return null;
}

/** Write orders array to the JSON file on disk */
function writeOrdersToFile(ordersArray) {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersArray, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ordersStore] Could not write orders file:", err.message);
  }
}

// ---------------------------------------------------------------------------
// Initialize: load from file, or seed with demo orders and persist them
// ---------------------------------------------------------------------------
const storedOrders = readOrdersFromFile();
if (!storedOrders) {
  writeOrdersToFile(INITIAL_ORDERS);
}

/**
 * Returns current active orders array from disk (or initial fallback).
 */
function getActiveOrders() {
  const fromDisk = readOrdersFromFile();
  if (fromDisk && Array.isArray(fromDisk) && fromDisk.length > 0) {
    return fromDisk;
  }
  return [...INITIAL_ORDERS];
}

// ---------------------------------------------------------------------------
// Public API (unchanged signatures — drop-in replacement)
// ---------------------------------------------------------------------------

/**
 * Checks if a session is authorized to view or manage a specific order.
 * - Admin users have universal access to all orders.
 * - Regular users can only access orders matching their sessionId or authenticated email.
 */
export function canAccessOrder(order, session) {
  if (!order || !session) return false;
  if (session.user?.role === "admin") return true;

  // 1. Match by sessionId
  if (order.sessionId && session.sessionId && order.sessionId === session.sessionId) {
    return true;
  }

  // 2. Match by authenticated user email
  const userEmail = session.user?.email?.toLowerCase().trim();
  if (userEmail) {
    const ownerEmail = order.ownerEmail?.toLowerCase().trim();
    const customerEmail = order.customer?.email?.toLowerCase().trim();
    if (ownerEmail === userEmail || customerEmail === userEmail) {
      return true;
    }
  }

  return false;
}

/**
 * Returns orders accessible to the current session:
 * - Admin: all orders
 * - Customer: only orders belonging to them
 * - Unauthenticated: empty array
 */
export async function getUserOrders(session) {
  if (!session || !session.isAuthenticated) {
    return [];
  }
  const currentOrders = getActiveOrders();
  if (session.user?.role === "admin") {
    return currentOrders;
  }
  return currentOrders.filter((o) => canAccessOrder(o, session));
}

export async function getOrders() {
  return getActiveOrders();
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  const currentOrders = getActiveOrders();
  const normalized = orderId.toString().trim().toUpperCase();
  return (
    currentOrders.find(
      (o) =>
        o.orderId.toUpperCase() === normalized ||
        o.orderId.toUpperCase() === `ORD-${normalized}`
    ) || null
  );
}

export async function saveOrder(order) {
  const currentOrders = getActiveOrders();
  const existingIndex = currentOrders.findIndex(
    (o) => o.orderId.toUpperCase() === order.orderId.toUpperCase()
  );
  if (existingIndex >= 0) {
    currentOrders[existingIndex] = order;
  } else {
    currentOrders.unshift(order);
  }
  writeOrdersToFile(currentOrders); // Persist to disk
  return order;
}

export async function updateOrder(orderId, updates) {
  const currentOrders = getActiveOrders();
  const normalized = orderId.toString().trim().toUpperCase();
  const order = currentOrders.find(
    (o) =>
      o.orderId.toUpperCase() === normalized ||
      o.orderId.toUpperCase() === `ORD-${normalized}`
  );
  if (order) {
    Object.assign(order, updates);
    writeOrdersToFile(currentOrders); // Persist to disk
    return order;
  }
  return null;
}

const STATUS_SEQUENCE = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export async function advanceOrderStatus(orderId) {
  const currentOrders = getActiveOrders();
  const normalized = orderId.toString().trim().toUpperCase();
  const order = currentOrders.find(
    (o) =>
      o.orderId.toUpperCase() === normalized ||
      o.orderId.toUpperCase() === `ORD-${normalized}`
  );
  if (!order || order.status === "Cancelled") return order;

  const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
  if (currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1) {
    order.status = STATUS_SEQUENCE[currentIndex + 1];
    if (order.status === "Delivered") {
      order.estimatedDeliveryMinutes = "0";
    } else if (order.status === "Out for Delivery") {
      order.estimatedDeliveryMinutes = "10-15";
    }
  }
  writeOrdersToFile(currentOrders); // Persist to disk
  return order;
}

/**
 * Server-Side Aggregation of Revenue, Daily Order Counts, and Operational Metrics
 * Authoritatively aggregates revenue, daily velocity, and order tallies on the server.
 */
export async function getAggregatedOrderMetrics() {
  const allOrders = getActiveOrders();

  let totalRevenue = 0;
  let confirmedRevenue = 0;
  let totalTax = 0;
  let totalDeliveryFees = 0;
  let pendingCount = 0;
  let preparingCount = 0;
  let servedCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  const dailyCountsMap = new Map(); // "YYYY-MM-DD" => { date, count, revenue }
  const dishSalesMap = new Map(); // dishId/name => { id, name, qty, revenue, image }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  let todayRevenue = 0;
  let todayOrderCount = 0;

  for (const order of allOrders) {
    const status = (order.status || "").toLowerCase();
    const orderTotal = Number(order.pricing?.total) || 0;
    const isCancelled = status === "cancelled";

    // 1. Status counters
    if (status === "pending") pendingCount++;
    else if (status === "preparing") preparingCount++;
    else if (status === "served" || status === "out for delivery") servedCount++;
    else if (status === "completed" || status === "delivered") completedCount++;
    else if (status === "cancelled") cancelledCount++;

    // 2. Revenue aggregation (excluding cancelled orders)
    if (!isCancelled) {
      totalRevenue += orderTotal;
      totalTax += Number(order.pricing?.tax) || 0;
      totalDeliveryFees += Number(order.pricing?.delivery) || 0;
      confirmedRevenue += orderTotal;
    }

    // 3. Daily grouping by order creation date
    const dateStr = order.createdAt ? order.createdAt.split("T")[0] : todayStr;
    const existingDay = dailyCountsMap.get(dateStr) || {
      date: dateStr,
      count: 0,
      revenue: 0,
    };
    existingDay.count += 1;
    if (!isCancelled) {
      existingDay.revenue += orderTotal;
    }
    dailyCountsMap.set(dateStr, existingDay);

    // Today's metrics
    if (dateStr === todayStr) {
      todayOrderCount += 1;
      if (!isCancelled) {
        todayRevenue += orderTotal;
      }
    }

    // 4. Dish sales aggregation
    if (!isCancelled && Array.isArray(order.items)) {
      for (const item of order.items) {
        const key = item.id || item.name;
        const existingDish = dishSalesMap.get(key) || {
          id: key,
          name: item.name,
          image: item.image || "/images/menu-1.jpg",
          qty: 0,
          revenue: 0,
        };
        const itemQty = Number(item.qty) || 1;
        existingDish.qty += itemQty;
        existingDish.revenue += itemQty * (Number(item.price) || 0);
        dishSalesMap.set(key, existingDish);
      }
    }
  }

  // Generate 7-day timeline for weekly charts
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const dayData = dailyCountsMap.get(dStr) || { count: 0, revenue: 0 };
    weeklyTrends.push({
      date: dStr,
      day: daysOfWeek[d.getDay()],
      count: dayData.count,
      revenue: Math.round(dayData.revenue * 100) / 100,
    });
  }

  // Top selling dishes sorted by quantity sold
  const topSellingDishes = Array.from(dishSalesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const activeOrdersCount = pendingCount + preparingCount;
  const nonCancelledCount = allOrders.length - cancelledCount;
  const averageOrderValue =
    nonCancelledCount > 0
      ? Math.round((totalRevenue / nonCancelledCount) * 100) / 100
      : 0;

  return {
    totalOrders: allOrders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    etbRevenue: Math.round(totalRevenue * 125.5),
    averageOrderValue,
    todayOrderCount,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    activeOrdersCount,
    statusCounts: {
      total: allOrders.length,
      pending: pendingCount,
      preparing: preparingCount,
      served: servedCount,
      completed: completedCount,
      cancelled: cancelledCount,
    },
    dailyOrderCounts: Array.from(dailyCountsMap.values()).sort((a, b) => b.date.localeCompare(a.date)),
    weeklyTrends,
    topSellingDishes,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Server-Side Aggregation with URL Sorting, URL Paging & Demonstrable States
 * Only summarized rows cross the boundary to client leaf components.
 *
 * @param {Object} options - { page, pageSize, sort, order, demo }
 * @returns {Promise<Object>} Summarized rows, pagination, kpis, and chart series
 */
export async function getServerAggregatedAnalytics({
  page = 1,
  pageSize = 4,
  sort = "date",
  order = "desc",
  demo = "",
} = {}) {
  // 1. Demonstrable Error State
  if (demo === "error") {
    throw new Error(
      "Demonstration Error: Failed to aggregate revenue transactions on the server. Please check database connectivity."
    );
  }

  // 2. Demonstrable Loading State (simulated async delay to demonstrate Suspense / loading.js)
  if (demo === "loading") {
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  // 3. Demonstrable Empty State
  if (demo === "empty") {
    return {
      summarizedRows: [],
      chartSeries: [],
      kpis: {
        totalRevenue: 0,
        etbRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeOrdersCount: 0,
      },
      pagination: {
        currentPage: 1,
        pageSize: Number(pageSize),
        totalRows: 0,
        totalPages: 0,
        hasPrev: false,
        hasNext: false,
      },
      sorting: {
        sort: String(sort),
        order: String(order),
      },
      isDemonstration: true,
      demoMode: "empty",
    };
  }

  // Normal server aggregation
  const allOrders = getActiveOrders();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group orders by date on server
  const dateMap = new Map();

  let totalRevenue = 0;
  let nonCancelledOrdersCount = 0;
  let pendingCount = 0;
  let preparingCount = 0;

  for (const o of allOrders) {
    const status = (o.status || "").toLowerCase();
    const isCancelled = status === "cancelled";
    const orderTotal = Number(o.pricing?.total) || 0;

    if (status === "pending") pendingCount++;
    if (status === "preparing") preparingCount++;

    if (!isCancelled) {
      totalRevenue += orderTotal;
      nonCancelledOrdersCount++;
    }

    const dateKey = o.createdAt ? o.createdAt.split("T")[0] : "2026-10-14";
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      day: daysOfWeek[new Date(dateKey).getDay()] || "Day",
      orderCount: 0,
      revenue: 0,
      pendingCount: 0,
      completedCount: 0,
    };

    existing.orderCount += 1;
    if (!isCancelled) {
      existing.revenue += orderTotal;
    }
    if (status === "pending") existing.pendingCount++;
    if (status === "completed" || status === "served") existing.completedCount++;

    dateMap.set(dateKey, existing);
  }

  // Convert to array of summarized rows
  let summarizedRows = Array.from(dateMap.values()).map((row) => ({
    ...row,
    revenue: Math.round(row.revenue * 100) / 100,
    avgOrderValue:
      row.orderCount > 0 ? Math.round((row.revenue / row.orderCount) * 100) / 100 : 0,
  }));

  // Full dataset for charts (sorted chronologically for time-series visualization)
  const chartSeries = [...summarizedRows].sort((a, b) => a.date.localeCompare(b.date));

  // Server-side sorting based on URL sort parameter
  const sortDirection = order.toLowerCase() === "asc" ? 1 : -1;
  summarizedRows.sort((a, b) => {
    switch (sort) {
      case "revenue":
        return (a.revenue - b.revenue) * sortDirection;
      case "orders":
        return (a.orderCount - b.orderCount) * sortDirection;
      case "avgOrderValue":
        return (a.avgOrderValue - b.avgOrderValue) * sortDirection;
      case "date":
      default:
        return a.date.localeCompare(b.date) * sortDirection;
    }
  });

  // Server-side pagination
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 4);
  const totalRows = summarizedRows.length;
  const totalPages = Math.ceil(totalRows / size);
  const startIndex = (currentPage - 1) * size;
  const paginatedRows = summarizedRows.slice(startIndex, startIndex + size);

  const averageOrderValue =
    nonCancelledOrdersCount > 0
      ? Math.round((totalRevenue / nonCancelledOrdersCount) * 100) / 100
      : 0;

  return {
    // ONLY summarized rows cross the boundary
    summarizedRows: paginatedRows,
    chartSeries,
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      etbRevenue: Math.round(totalRevenue * 125.5),
      totalOrders: allOrders.length,
      averageOrderValue,
      activeOrdersCount: pendingCount + preparingCount,
    },
    pagination: {
      currentPage,
      pageSize: size,
      totalRows,
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
    },
    sorting: {
      sort,
      order: order.toLowerCase() === "asc" ? "asc" : "desc",
    },
    isDemonstration: false,
    demoMode: demo || "live",
  };
}
