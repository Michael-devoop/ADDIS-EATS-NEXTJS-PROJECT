import { getDish } from "@/data/menuData";

// Server-side live pricing engine evaluated per-request
export async function getLivePricing() {
  const now = new Date();
  const currentHour = now.getHours();

  // Dynamic peak-hour delivery calculation (e.g., lunch 12-14, dinner 19-22)
  const isPeakHour = (currentHour >= 12 && currentHour <= 14) || (currentHour >= 19 && currentHour <= 22);
  const liveDeliveryFee = isPeakHour ? 5.5 : 4.0;

  return {
    taxRate: 0.08, // 8% sales & meal tax
    baseDeliveryFee: liveDeliveryFee,
    freeDeliveryThreshold: 60.0,
    isPeakHour,
    surgeLabel: isPeakHour ? "Peak Hour Service" : "Standard Delivery",
    etbExchangeRate: 125.5, // Live ETB conversion for Addis Eats
    timestamp: now.toISOString(),
    formattedTime: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

/**
 * Server-Side Price & Catalog Protection:
 * Verifies every item against the server database, ignores any client-tampered prices,
 * and calculates authentic subtotal, taxes, delivery fees, and grand totals.
 */
export async function calculateVerifiedOrderPricing(items) {
  const livePricing = await getLivePricing();

  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const dish = await getDish(item.id);
    if (!dish) {
      throw new Error(`Dish '${item.name || item.id}' is not in the official menu.`);
    }

    // Canonical server-side price protection
    const canonicalPrice = dish.price;
    const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    const lineTotal = canonicalPrice * qty;
    subtotal += lineTotal;

    verifiedItems.push({
      id: dish.id,
      name: dish.name,
      price: canonicalPrice, // Authentic server price
      qty,
      image: dish.image,
      desc: dish.desc,
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    });
  }

  const tax = subtotal * livePricing.taxRate;
  const isFreeDelivery = subtotal >= livePricing.freeDeliveryThreshold;
  const delivery = subtotal > 0 ? (isFreeDelivery ? 0 : livePricing.baseDeliveryFee) : 0;
  const total = subtotal + tax + delivery;

  return {
    verifiedItems,
    pricing: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      delivery: parseFloat(delivery.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      currency: "USD",
      etbEquivalent: (total * livePricing.etbExchangeRate).toFixed(2),
    },
    livePricing,
  };
}
