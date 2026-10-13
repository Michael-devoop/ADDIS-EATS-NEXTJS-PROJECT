import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrders, getAggregatedOrderMetrics } from "@/lib/ordersStore";
import { getDishes } from "@/data/menuData";
import { getAllUsers } from "@/lib/usersStore";
import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operations Admin Portal | Addis Eats",
  description: "Live restaurant management control panel for Addis Eats.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  // 1. Strictly enforce active authenticated session
  const session = await getSession();

  if (!session || !session.isAuthenticated) {
    redirect("/login?redirect=/admin/dashboard");
  }

  // 2. Strictly enforce administrator role privileges
  if (session.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20 px-4">
        <div className="rounded-3xl border border-red-200 bg-white p-8 sm:p-12 text-center shadow-xl max-w-lg w-full">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 text-3xl">
            🛡️
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            403 Forbidden
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-dark mt-2">
            Administrator Access Required
          </h1>
          <p className="mt-3 text-sm text-[#4b5563] leading-relaxed">
            You are currently signed in as <strong>{session.user?.email}</strong> with customer privileges. The Restaurant Operations Dashboard is strictly restricted to administrator accounts.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/order-history"
              className="button !py-2.5 !text-xs !bg-dark !border-dark hover:!bg-transparent hover:!text-dark"
            >
              View My Customer Orders
            </Link>
            <Link
              href="/login?redirect=/admin/dashboard&switch=true"
              className="button !py-2.5 !text-xs"
            >
              Sign In As Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Pre-load live orders, dish catalog, users, and server-aggregated metrics in parallel
  const [orders, dishes, users, serverMetrics] = await Promise.all([
    getOrders(),
    getDishes(),
    getAllUsers(),
    getAggregatedOrderMetrics(),
  ]);

  return (
    <AdminProvider
      initialOrders={orders}
      initialDishes={dishes}
      initialUsers={users}
      serverMetrics={serverMetrics}
      session={session}
    >
      <div className="min-h-screen bg-[#f4f5f7] text-[#111827] flex font-sans antialiased">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
