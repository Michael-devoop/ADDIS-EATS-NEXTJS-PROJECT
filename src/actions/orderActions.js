"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { OrderSchema } from "@/lib/validations/order";
import { calculateVerifiedOrderPricing } from "@/lib/pricing";
import {
  saveOrder,
  getOrderById,
  updateOrder,
  canAccessOrder,
} from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

/**
 * Server Action: placeOrder
 * Submits and validates orders directly from forms on the server.
 * Protects prices by checking the canonical dish catalog on the server.
 * Tracks session ownership for post-order operations.
 * Calls revalidatePath to refresh cached views.
 *
 * @param {Object} prevState - Previous form action state
 * @param {FormData|Object} formData - Form submission data or plain order payload
 * @returns {Promise<{success: boolean, order?: Object, error?: string, fieldErrors?: Object}>}
 */
export async function placeOrder(prevState, formData) {
  try {
    // 1. Strictly verify user authentication before mutating data
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session || !session.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: You must be signed in to place an order.",
        fieldErrors: {},
      };
    }

    let rawPayload = {};

    if (formData instanceof FormData) {
      // 2. Extract items from hidden serialized form input
      let items = [];
      const cartItemsRaw = formData.get("cartItems") || formData.get("items");
      if (cartItemsRaw) {
        try {
          items = JSON.parse(cartItemsRaw.toString());
        } catch {
          items = [];
        }
      }

      // 3. Extract customer details from FormData
      const customer = {
        firstName: (formData.get("firstName") || "").toString().trim(),
        lastName: (formData.get("lastName") || "").toString().trim(),
        companyName: (formData.get("companyName") || "").toString().trim(),
        email: (formData.get("email") || session.user?.email || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        country: (formData.get("country") || "Ethiopia").toString().trim(),
        address: (formData.get("address") || "").toString().trim(),
        zipCode: (formData.get("zipCode") || "").toString().trim(),
        city: (formData.get("city") || "").toString().trim(),
        orderNotes: (formData.get("orderNotes") || "").toString().trim(),
        createAccount:
          formData.get("createAccount") === "on" ||
          formData.get("createAccount") === "true",
      };

      // 4. Extract payment method
      const paymentMethod = (
        formData.get("paymentMethod") ||
        formData.get("paymentSelection") ||
        formData.get("payment") ||
        "telebirr"
      ).toString();

      rawPayload = {
        items,
        customer,
        paymentMethod,
      };
    } else if (formData && typeof formData === "object") {
      // Direct JS object payload passed to action
      rawPayload = formData;
    }

    // 5. Server-side validation using Zod
    const validation = OrderSchema.safeParse(rawPayload);

    if (!validation.success) {
      const fieldErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }

      return {
        success: false,
        error: "Validation failed: Please correct the highlighted errors.",
        fieldErrors,
        details: validation.error.flatten(),
      };
    }

    const { items, customer, paymentMethod } = validation.data;

    // 6. Protect sensitive operations: Verify catalog and calculate authentic prices on server
    let verifiedCalculation;
    try {
      verifiedCalculation = await calculateVerifiedOrderPricing(items);
    } catch (pricingError) {
      return {
        success: false,
        error: pricingError.message || "Failed to calculate order pricing",
        fieldErrors: { items: pricingError.message },
        details: null,
      };
    }

    const { verifiedItems, pricing } = verifiedCalculation;

    // 7. Bind order strictly to authenticated user context
    const sessionId = session.sessionId;
    const userEmail = session.user?.email || customer.email;

    // 8. Assemble and save the validated order record
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      sessionId,
      ownerEmail: userEmail,
      items: verifiedItems,
      customer,
      paymentMethod,
      pricing,
      status: "Confirmed",
      estimatedDeliveryMinutes: "30-45",
      createdAt: new Date().toISOString(),
    };

    await saveOrder(newOrder);

    // 9. Revalidate cached routes after successful write
    revalidatePath("/checkout");
    revalidatePath("/cart");
    revalidatePath("/menu");
    revalidatePath("/api/orders");
    revalidatePath("/order-history");

    return {
      success: true,
      message: "Order placed successfully via Server Action",
      order: newOrder,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("Server Action placeOrder error:", error);
    return {
      success: false,
      error: error.message || "An unexpected server error occurred.",
      fieldErrors: {},
    };
  }
}

/**
 * Server Action: cancelOrder
 * Sensitive operation: Cancels an existing order.
 * Strictly verifies BOTH:
 *  1. Authentication / Active session existence
 *  2. Record ownership (session ID or authenticated owner email matches the order)
 *
 * @param {string|Object} payload - orderId string or { orderId } object
 * @returns {Promise<{success: boolean, message?: string, order?: Object, error?: string}>}
 */
export async function cancelOrder(payload) {
  try {
    const orderId = typeof payload === "string" ? payload : payload?.orderId;

    if (!orderId) {
      return {
        success: false,
        error: "Missing order ID. Please specify which order to cancel.",
      };
    }

    // 1. Verify session & authentication using getSession()
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session || !session.isAuthenticated) {
      return {
        success: false,
        error: "Unauthorized: Active session required to cancel an order.",
      };
    }

    // 2. Fetch the existing order from server storage
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        success: false,
        error: `Order '${orderId}' not found.`,
      };
    }

    // 3. Verify permissions & ownership of the record
    if (!canAccessOrder(order, session)) {
      return {
        success: false,
        error: "Forbidden: You do not own this order record and lack permission to cancel it.",
      };
    }

    // 4. Check current status & transition validity
    if (order.status === "Cancelled") {
      return {
        success: false,
        error: "This order has already been cancelled.",
      };
    }

    if (order.status === "Delivered") {
      return {
        success: false,
        error: "Cannot cancel an order that has already been delivered.",
      };
    }

    // 5. Update order record
    const updatedOrder = await updateOrder(orderId, {
      status: "Cancelled",
      cancelledAt: new Date().toISOString(),
    });

    // 6. Revalidate cached routes after state mutation
    revalidatePath("/checkout");
    revalidatePath("/cart");
    revalidatePath("/api/orders");
    revalidatePath("/order-history");

    return {
      success: true,
      message: `Order ${orderId} has been successfully cancelled.`,
      order: updatedOrder || order,
    };
  } catch (error) {
    console.error("Server Action cancelOrder error:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel order due to a server error.",
    };
  }
}

// Backwards-compatible alias for previous submitOrderAction name
export const submitOrderAction = placeOrder;
