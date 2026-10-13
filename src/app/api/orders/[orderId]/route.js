import { NextResponse } from "next/server";
import {
  getOrderById,
  updateOrder,
  advanceOrderStatus,
  canAccessOrder,
} from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

// GET /api/orders/[orderId] - Fetch single order details with ownership verification
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active session required to view order details.",
        },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.orderId || resolvedParams.id;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
          details: `No active order matches ID '${id}'`,
        },
        { status: 404 }
      );
    }

    // Enforce ownership: only the owner or an admin may view this order
    if (!canAccessOrder(order, session)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You do not have permission to view this order.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve order status",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[orderId] - Advance or update order status with ownership verification
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active session required to modify order.",
        },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.orderId || resolvedParams.id;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
          details: `Cannot update order with ID '${id}'`,
        },
        { status: 404 }
      );
    }

    // Enforce ownership: only the owner or an admin may modify this order
    if (!canAccessOrder(order, session)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You do not have permission to modify this order.",
        },
        { status: 403 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    let updatedOrder = null;

    if (body.action === "cancel") {
      if (order.status === "Cancelled") {
        return NextResponse.json(
          { success: false, error: "This order has already been cancelled." },
          { status: 400 }
        );
      }
      if (order.status === "Delivered") {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot cancel an order that has already been delivered.",
          },
          { status: 400 }
        );
      }
      updatedOrder = await updateOrder(id, {
        status: "Cancelled",
        cancelledAt: new Date().toISOString(),
      });
    } else if (body.action === "advance") {
      if (order.status === "Delivered" || order.status === "Cancelled") {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot advance an order with status '${order.status}'.`,
          },
          { status: 400 }
        );
      }
      updatedOrder = await advanceOrderStatus(id);
    } else if (body.status) {
      // Direct status overriding requires admin role
      if (session.user?.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden: Administrator privileges required to set custom order status.",
          },
          { status: 403 }
        );
      }
      updatedOrder = await updateOrder(id, { status: body.status });
    } else {
      updatedOrder = await advanceOrderStatus(id);
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
          details: `Cannot update order with ID '${id}'`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to '${updatedOrder.status}'`,
      order: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order status",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}
