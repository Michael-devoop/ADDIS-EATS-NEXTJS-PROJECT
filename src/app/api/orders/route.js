import { NextResponse } from "next/server";
import { getLivePricing, calculateVerifiedOrderPricing } from "@/lib/pricing";
import { OrderSchema } from "@/lib/validations/order";
import {
  getOrders,
  getOrderById,
  saveOrder,
  getUserOrders,
  canAccessOrder,
} from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

// GET /api/orders - Retrieve authenticated user's orders or check specific order by orderId
export async function GET(request) {
  // 1. Verify active session
  const session = await getSession();
  if (!session || !session.isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Active session required to access orders.",
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (orderId) {
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Enforce strict ownership check
    if (!canAccessOrder(order, session)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You do not have permission to view this order.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  }

  // 3. Return strictly the orders belonging to the authenticated user (or all if admin)
  const userOrders = await getUserOrders(session);
  return NextResponse.json(
    {
      success: true,
      count: userOrders.length,
      orders: userOrders,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
      },
    }
  );
}

// POST /api/orders - Validate order using Zod and verify session before saving
export async function POST(request) {
  try {
    // 1. Strictly verify user authentication
    const session = await getSession();
    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active session required to place an order.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 2. Server-side validation using Zod schema
    const validation = OrderSchema.safeParse(body);

    if (!validation.success) {
      // Structure field errors by path for client-side field highlighting
      const fieldErrors = {};
      for (const issue of validation.error.issues) {
        const fieldKey = issue.path.join(".");
        if (!fieldErrors[fieldKey]) {
          fieldErrors[fieldKey] = issue.message;
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Order validation failed",
          fieldErrors,
          details: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    // 3. Extract strictly validated and sanitized data
    const validatedData = validation.data;
    const { items, customer, paymentMethod } = validatedData;

    // 4. Evaluate authentic server-side pricing and verify dish catalog
    let verifiedCalculation;
    try {
      verifiedCalculation = await calculateVerifiedOrderPricing(items);
    } catch (pricingError) {
      return NextResponse.json(
        {
          success: false,
          error: pricingError.message || "Invalid items in order",
          fieldErrors: { items: pricingError.message },
          details: null,
        },
        { status: 422 }
      );
    }

    const { verifiedItems, pricing } = verifiedCalculation;

    // 5. Construct and save validated order bound to verified user
    const newOrder = {
      orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      sessionId: session.sessionId,
      ownerEmail: session.user?.email || customer.email,
      items: verifiedItems,
      customer,
      paymentMethod,
      pricing,
      status: "Confirmed",
      estimatedDeliveryMinutes: "30-45",
      createdAt: new Date().toISOString(),
    };

    await saveOrder(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: "Order validated and placed successfully",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed request or server error",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}
