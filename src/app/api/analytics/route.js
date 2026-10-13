import { NextResponse } from "next/server";
import { getAggregatedOrderMetrics } from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

// GET /api/analytics - Server-side aggregated revenue and daily order counts
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const aggregated = await getAggregatedOrderMetrics();

    return NextResponse.json(
      {
        success: true,
        analytics: aggregated,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Analytics aggregation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to aggregate order and revenue metrics on server.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
