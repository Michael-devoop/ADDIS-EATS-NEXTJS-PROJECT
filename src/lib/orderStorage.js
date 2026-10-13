"use client";

// Client-side localStorage persistence for orders
// Ensures orders are saved, updated, and retrieved from the browser's localStorage.

export const ORDERS_STORAGE_KEY = "orders";
export const SCOPED_ORDERS_KEY = "addis_eats_orders";
export const LATEST_ORDER_KEY = "latest_order";
export const SCOPED_LATEST_KEY = "addis_eats_latest_order";
export const LAST_ORDER_ID_KEY = "last_order_id";

/**
 * Safely reads all orders from browser localStorage.
 * Checks both "orders" and "addis_eats_orders".
 * @returns {Array<Object>}
 */
export function getStoredOrders() {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(ORDERS_STORAGE_KEY) ||
      localStorage.getItem(SCOPED_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[orderStorage] Failed to parse orders from localStorage:", err);
    return [];
  }
}

/**
 * Retrieves a single order from localStorage by its orderId.
 * @param {string} orderId
 * @returns {Object|null}
 */
export function getStoredOrderById(orderId) {
  if (typeof window === "undefined" || !orderId) return null;
  const orders = getStoredOrders();
  const normalized = orderId.toString().trim().toUpperCase();
  return (
    orders.find(
      (o) =>
        o?.orderId?.toUpperCase() === normalized ||
        o?.orderId?.toUpperCase() === `ORD-${normalized}`
    ) || null
  );
}

/**
 * Saves a new order or updates an existing order in browser localStorage.
 * Writes to both "orders" and "addis_eats_orders", plus latest order keys.
 * @param {Object} order
 * @returns {Array<Object>}
 */
export function saveOrderToLocalStorage(order) {
  if (typeof window === "undefined" || !order || !order.orderId) return [];
  try {
    const current = getStoredOrders();
    const normalizedId = order.orderId.toUpperCase();
    const existingIndex = current.findIndex(
      (o) => o?.orderId?.toUpperCase() === normalizedId
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...order,
      };
    } else {
      updated = [order, ...current];
    }

    const jsonStr = JSON.stringify(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, jsonStr);
    localStorage.setItem(SCOPED_ORDERS_KEY, jsonStr);

    // Latest order references
    const orderJson = JSON.stringify(order);
    localStorage.setItem(LATEST_ORDER_KEY, orderJson);
    localStorage.setItem(SCOPED_LATEST_KEY, orderJson);
    localStorage.setItem(LAST_ORDER_ID_KEY, order.orderId);

    // Dispatch event so components update reactively
    window.dispatchEvent(
      new CustomEvent("ordersUpdated", { detail: { orders: updated, order } })
    );

    return updated;
  } catch (err) {
    console.warn("[orderStorage] Failed to save order to localStorage:", err);
    return [];
  }
}

/**
 * Merges server orders into localStorage without losing existing orders.
 * @param {Array<Object>} serverOrders
 * @returns {Array<Object>}
 */
export function syncOrdersToLocalStorage(serverOrders = []) {
  if (typeof window === "undefined") return [];
  if (!Array.isArray(serverOrders) || serverOrders.length === 0) {
    return getStoredOrders();
  }

  try {
    const local = getStoredOrders();
    const map = new Map();

    // 1. Put local orders first
    for (const ord of local) {
      if (ord?.orderId) {
        map.set(ord.orderId.toUpperCase(), ord);
      }
    }

    // 2. Merge server orders (update or insert)
    for (const ord of serverOrders) {
      if (ord?.orderId) {
        const id = ord.orderId.toUpperCase();
        const existing = map.get(id);
        map.set(id, existing ? { ...existing, ...ord } : ord);
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    const jsonStr = JSON.stringify(merged);
    localStorage.setItem(ORDERS_STORAGE_KEY, jsonStr);
    localStorage.setItem(SCOPED_ORDERS_KEY, jsonStr);

    if (merged.length > 0) {
      localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(merged[0]));
      localStorage.setItem(SCOPED_LATEST_KEY, JSON.stringify(merged[0]));
      localStorage.setItem(LAST_ORDER_ID_KEY, merged[0].orderId);
    }

    window.dispatchEvent(
      new CustomEvent("ordersUpdated", { detail: { orders: merged } })
    );

    return merged;
  } catch (err) {
    console.warn("[orderStorage] Failed to sync orders to localStorage:", err);
    return [];
  }
}

/**
 * Updates the status of an existing order in localStorage.
 * @param {string} orderId
 * @param {string} newStatus
 * @param {Object} [extraFields]
 */
export function updateStoredOrderStatus(orderId, newStatus, extraFields = {}) {
  if (typeof window === "undefined" || !orderId) return;
  try {
    const orders = getStoredOrders();
    const normalized = orderId.toUpperCase();
    const target = orders.find(
      (o) =>
        o?.orderId?.toUpperCase() === normalized ||
        o?.orderId?.toUpperCase() === `ORD-${normalized}`
    );

    if (target) {
      target.status = newStatus;
      Object.assign(target, extraFields);

      const jsonStr = JSON.stringify(orders);
      localStorage.setItem(ORDERS_STORAGE_KEY, jsonStr);
      localStorage.setItem(SCOPED_ORDERS_KEY, jsonStr);

      window.dispatchEvent(
        new CustomEvent("ordersUpdated", { detail: { orders, order: target } })
      );
    }
  } catch (err) {
    console.warn("[orderStorage] Failed to update order status in localStorage:", err);
  }
}
