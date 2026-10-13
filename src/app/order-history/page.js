import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import OrderHistoryView from "@/components/OrderHistoryView";
import { getUserOrders } from "@/lib/ordersStore";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order History",
  description:
    "View and track your previous and active restaurant orders with real-time status updates.",
  openGraph: {
    title: "Order History | Addis Eats",
    description:
      "View and track your previous and active restaurant orders with real-time status updates.",
    url: "/order-history",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Order History",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order History | Addis Eats",
    description:
      "View and track your previous and active restaurant orders with real-time status updates.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/order-history",
  },
};

export default async function OrderHistoryPage() {
  // 1. Verify session on the server
  const session = await getSession();
  if (!session || !session.isAuthenticated) {
    redirect("/login?redirect=/order-history");
  }

  // 2. Fetch strictly this user's orders (admins receive all)
  const initialOrders = await getUserOrders(session);

  return (
    <div>
      <PageBanner
        title="Order History"
        description="Review your past orders, monitor current kitchen preparation, or track real-time delivery status."
        breadcrumbs={[{ label: "Order History", href: "/order-history" }]}
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <OrderHistoryView initialOrders={initialOrders} />
        </div>
      </section>
    </div>
  );
}
