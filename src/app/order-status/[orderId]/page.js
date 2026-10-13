import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import OrderTrackingView from "@/components/OrderTrackingView";
import { getOrderById, getUserOrders, canAccessOrder } from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { orderId } = await params;
  return {
    title: `Order #${orderId} Live Delivery Tracking | Addis Eats`,
    description: `Live Leaflet map and real-time courier telemetry for order #${orderId}.`,
    openGraph: {
      title: `Order #${orderId} Status | Addis Eats`,
      description: `Live Leaflet map and real-time courier telemetry for order #${orderId}.`,
      url: `/order-status/${orderId}`,
    },
  };
}

/**
 * Server Page: Order Live Status & Courier Telemetry
 * - Leaflet map showing courier and delivery destination
 * - Live status over Server-Sent Events (SSE) seeded from the server render
 * - Every value formatted through one shared module (@/lib/format)
 * - CSV export of order history that survives awkward data
 */
export default async function OrderStatusDetailPage({ params }) {
  // 1. Enforce active session
  const session = await getSession();
  const { orderId } = await params;

  if (!session || !session.isAuthenticated) {
    redirect(`/login?redirect=/order-status/${orderId}`);
  }

  // 2. Fetch order and user orders list on the server (seed render)
  const [initialOrder, userOrders] = await Promise.all([
    getOrderById(orderId),
    getUserOrders(session),
  ]);

  // 3. Verify order ownership or admin privilege
  const isAuthorized = initialOrder && canAccessOrder(initialOrder, session);

  return (
    <div>
      <PageBanner
        title={`Live Tracking #${orderId}`}
        description="Real-time Leaflet courier telemetry and live order status streamed via Server-Sent Events."
        breadcrumbs={[
          { label: "Order History", href: "/order-history" },
          { label: "Live Delivery Map", href: `/order-status/${orderId}` },
        ]}
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {!initialOrder ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-xs max-w-lg mx-auto">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                🔎
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-dark">
                Order Not Found (404)
              </h3>
              <p className="mt-2 text-xs text-[#6b6f72]">
                No active delivery record was found matching tracking ID <strong>{orderId}</strong>.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/order-history" className="button !py-2.5 !text-xs">
                  View My Order History
                </Link>
              </div>
            </div>
          ) : !isAuthorized ? (
            <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 text-center shadow-xs max-w-lg mx-auto">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 text-2xl">
                🛡️
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-red-800">
                Access Denied (403 Forbidden)
              </h3>
              <p className="mt-2 text-xs text-red-600 leading-relaxed">
                You do not have permission to inspect order <strong>{orderId}</strong>. Live telemetry is restricted to the ordering customer or staff.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/order-history"
                  className="rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-800 shadow-xs"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          ) : (
            <Suspense fallback={null}>
              <OrderTrackingView
                orderId={orderId}
                initialOrder={initialOrder}
                userOrders={userOrders}
              />
            </Suspense>
          )}
        </div>
      </section>
    </div>
  );
}
