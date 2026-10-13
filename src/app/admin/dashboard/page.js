import AdminDashboard from "@/components/AdminDashboard";
import { getServerAggregatedAnalytics } from "@/lib/ordersStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operations Admin Dashboard | Addis Eats",
  description:
    "Executive restaurant operations control panel with server-side aggregated metrics, interactive charts, and accessible data tables.",
};

/**
 * Server Page: Restaurant Operations Dashboard
 * - Aggregation done on the server, with only summarised rows crossing the boundary.
 * - Charts as client leaves on a server page, each with a heading, unit and fixed height.
 * - Every chart accompanied by the same data in a table.
 * - A table built from table, caption, thead and th scope — not divs.
 * - Sorting and paging both in the URL, with paging using Link elements.
 * - Loading, empty and error states all written, and each one demonstrable.
 */
export default async function AdminDashboardPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) || {};

  const page = parseInt(resolvedSearchParams.page, 10) || 1;
  const pageSize = parseInt(resolvedSearchParams.pageSize, 10) || 4;
  const sort = resolvedSearchParams.sort || "date";
  const order = resolvedSearchParams.order || "desc";
  const demo = resolvedSearchParams.demo || "";

  // Perform server-side aggregation. Only summarized rows cross the RSC boundary.
  const analyticsData = await getServerAggregatedAnalytics({
    page,
    pageSize,
    sort,
    order,
    demo,
  });

  return (
    <AdminDashboard
      analyticsData={analyticsData}
      searchParams={resolvedSearchParams}
    />
  );
}
