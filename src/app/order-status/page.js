import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { getOrderById, getUserOrders, canAccessOrder } from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Order Status",
  description:
    "Track your order status in real time, from kitchen preparation to doorstep delivery, with live updates.",
  openGraph: {
    title: "Live Order Status | Addis Eats",
    description:
      "Track your order status in real time, from kitchen preparation to doorstep delivery, with live updates.",
    url: "/order-status",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Live Order Status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Order Status | Addis Eats",
    description:
      "Track your order status in real time, from kitchen preparation to doorstep delivery, with live updates.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/order-status",
  },
};

export default async function OrderStatusPage({ searchParams }) {
  // 1. Enforce session authentication (defense-in-depth with middleware)
  const session = await getSession();
  if (!session || !session.isAuthenticated) {
    redirect("/login?redirect=/order-status");
  }

  const resolvedParams = await searchParams;
  let targetOrderId = resolvedParams?.orderId;
  const userOrders = await getUserOrders(session);

  let initialOrder = null;
  let accessDenied = false;

  if (targetOrderId) {
    const fetched = await getOrderById(targetOrderId);
    if (fetched) {
      if (canAccessOrder(fetched, session)) {
        initialOrder = fetched;
      } else {
        accessDenied = true;
      }
    }
  } else {
    // If no orderId requested, track this user's most recent order
    if (userOrders.length > 0) {
      initialOrder = userOrders[0];
      targetOrderId = initialOrder.orderId;
    }
  }

  return (
    <div>
      <PageBanner
        title="Live Order Status"
        description="Monitor kitchen preparation and courier transit in real-time. Automatically updates every 5 seconds via SWR."
        breadcrumbs={[
          { label: "Order History", href: "/order-history" },
          {
            label: "Live Tracker",
            href: targetOrderId
              ? `/order-status?orderId=${targetOrderId}`
              : "/order-status",
          },
        ]}
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          {accessDenied ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm max-w-xl mx-auto">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-red-800">
                Access Denied (403 Forbidden)
              </h3>
              <p className="mt-2 text-xs text-red-600">
                You do not have permission to access order <strong>{targetOrderId}</strong>. Users can only view and track their own orders.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/order-history"
                  className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
                >
                  View My Orders
                </Link>
                {userOrders[0] && (
                  <Link
                    href={`/order-status?orderId=${userOrders[0].orderId}`}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-dark transition hover:bg-gray-50"
                  >
                    Track My Latest Order
                  </Link>
                )}
              </div>
            </div>
          ) : !targetOrderId && userOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm max-w-xl mx-auto">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-dark">
                No Orders Placed Yet
              </h3>
              <p className="mt-1 text-xs text-[#6b6f72]">
                You have not placed any orders yet. Place an order to start tracking delivery in real-time.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/menu" className="button !py-2.5 !text-xs">
                  Browse Menu & Order
                </Link>
              </div>
            </div>
          ) : (
            <Suspense fallback={null}>
              <OrderStatusTracker
                initialOrderId={targetOrderId}
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
