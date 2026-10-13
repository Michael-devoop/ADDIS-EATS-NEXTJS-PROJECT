import Link from "next/link";

/**
 * Semantic Aggregated Data Table Component
 * - Built strictly from <table>, <caption>, <thead>, <th scope="col">, <tbody>, <th scope="row">, <td> (NOT DIVS)
 * - Sorting in the URL via Next.js <Link> elements
 * - Paging in the URL strictly using Next.js <Link> elements
 * - Only summarized rows cross the boundary
 *
 * @param {Object} props
 * @param {Array} props.rows - Summarized rows
 * @param {Object} props.pagination - { currentPage, pageSize, totalRows, totalPages, hasPrev, hasNext }
 * @param {Object} props.sorting - { sort, order }
 * @param {string} props.demoMode - Active demo query param if any
 */
export default function AggregatedDataTable({
  rows = [],
  pagination = {
    currentPage: 1,
    pageSize: 4,
    totalRows: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  },
  sorting = { sort: "date", order: "desc" },
  demoMode = "",
}) {
  const { currentPage, pageSize, totalRows, totalPages, hasPrev, hasNext } = pagination;
  const { sort, order } = sorting;

  // Helper to build URL with query params
  const buildUrl = (newParams) => {
    const params = new URLSearchParams();
    const finalParams = {
      page: currentPage,
      pageSize,
      sort,
      order,
      ...(demoMode ? { demo: demoMode } : {}),
      ...newParams,
    };

    Object.entries(finalParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    });

    return `?${params.toString()}`;
  };

  // Helper for sort link toggle
  const getSortLink = (colKey) => {
    const isCurrent = sort === colKey;
    const nextOrder = isCurrent && order === "desc" ? "asc" : "desc";
    return buildUrl({ sort: colKey, order: nextOrder, page: 1 });
  };

  const renderSortIndicator = (colKey) => {
    if (sort !== colKey) {
      return <span className="ml-1 text-gray-300 font-normal">⇅</span>;
    }
    return (
      <span className="ml-1 text-[#f95738] font-black">
        {order === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const startIndex = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
      {/* Table Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-heading font-black text-lg text-[#111827]">
            Server-Aggregated Daily Performance Table
          </h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            URL-sorted and paginated summary records processed on the server
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          Showing {startIndex}–{endIndex} of {totalRows} days
        </div>
      </div>

      {/* Semantic Table: Strictly table, caption, thead, th scope, tbody, th scope="row", td */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <caption className="sr-only">
            Server-aggregated daily restaurant revenue, ticket volume, and average order value
          </caption>

          <thead className="bg-[#f9fafb] text-gray-700 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-bold">
                <Link
                  href={getSortLink("date")}
                  className="inline-flex items-center hover:text-[#f95738] transition focus:outline-none focus:underline"
                  title="Sort by date"
                >
                  <span>Date & Day</span>
                  {renderSortIndicator("date")}
                </Link>
              </th>

              <th scope="col" className="px-5 py-3.5 font-bold text-right">
                <Link
                  href={getSortLink("revenue")}
                  className="inline-flex items-center hover:text-[#f95738] transition focus:outline-none focus:underline ml-auto"
                  title="Sort by gross revenue"
                >
                  <span>Gross Revenue (USD)</span>
                  {renderSortIndicator("revenue")}
                </Link>
              </th>

              <th scope="col" className="px-5 py-3.5 font-bold text-center">
                <Link
                  href={getSortLink("orders")}
                  className="inline-flex items-center hover:text-[#f95738] transition focus:outline-none focus:underline justify-center"
                  title="Sort by total orders"
                >
                  <span>Total Orders</span>
                  {renderSortIndicator("orders")}
                </Link>
              </th>

              <th scope="col" className="px-5 py-3.5 font-bold text-right">
                <Link
                  href={getSortLink("avgOrderValue")}
                  className="inline-flex items-center hover:text-[#f95738] transition focus:outline-none focus:underline ml-auto"
                  title="Sort by average ticket size"
                >
                  <span>Avg Ticket (AOV)</span>
                  {renderSortIndicator("avgOrderValue")}
                </Link>
              </th>

              <th scope="col" className="px-5 py-3.5 font-bold text-right">
                Revenue (ETB)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-xs text-gray-400 italic"
                >
                  No summarized rows matching current query parameters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.date}
                  className="hover:bg-[#fef8f6]/40 transition group"
                >
                  {/* Row header with scope="row" */}
                  <th
                    scope="row"
                    className="px-5 py-4 font-normal text-left"
                  >
                    <div className="font-mono font-bold text-[#111827]">
                      {row.date}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-400">
                      {row.day}
                    </div>
                  </th>

                  <td className="px-5 py-4 text-right font-black text-emerald-600">
                    ${row.revenue.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black bg-orange-50 text-[#f95738] border border-orange-200">
                      {row.orderCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-gray-800">
                    ${row.avgOrderValue.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-gray-500 font-mono">
                    {Math.round(row.revenue * 125.5).toLocaleString()} ETB
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* URL-Driven Paging Using Strictly Next.js <Link> Elements */}
      <nav
        aria-label="Table pagination navigation"
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs"
      >
        <div className="text-gray-500 font-medium">
          Page <span className="font-bold text-[#111827]">{currentPage}</span> of{" "}
          <span className="font-bold text-[#111827]">{Math.max(1, totalPages)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Previous Link */}
          {hasPrev ? (
            <Link
              href={buildUrl({ page: currentPage - 1 })}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-dark hover:border-[#f95738] hover:text-[#f95738] transition shadow-2xs"
              aria-label="Previous page"
            >
              ← Previous
            </Link>
          ) : (
            <span
              className="px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50 font-bold text-gray-300 cursor-not-allowed select-none"
              aria-disabled="true"
            >
              ← Previous
            </span>
          )}

          {/* Page Number Links */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isCurrent = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                href={buildUrl({ page: pageNum })}
                aria-current={isCurrent ? "page" : undefined}
                className={`h-8 w-8 flex items-center justify-center rounded-xl font-bold transition ${
                  isCurrent
                    ? "bg-[#f95738] text-white shadow-xs shadow-[#f95738]/25"
                    : "border border-gray-200 bg-white text-dark hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          {/* Next Link */}
          {hasNext ? (
            <Link
              href={buildUrl({ page: currentPage + 1 })}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-dark hover:border-[#f95738] hover:text-[#f95738] transition shadow-2xs"
              aria-label="Next page"
            >
              Next →
            </Link>
          ) : (
            <span
              className="px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50 font-bold text-gray-300 cursor-not-allowed select-none"
              aria-disabled="true"
            >
              Next →
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
