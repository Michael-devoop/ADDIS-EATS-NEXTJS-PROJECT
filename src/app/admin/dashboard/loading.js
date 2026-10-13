/**
 * Demonstrable Next.js App Router Loading State
 * Automatically streamed by Next.js Suspense boundary when data is being fetched
 * or when ?demo=loading is requested.
 */
export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading analytics dashboard"
      className="p-6 lg:p-8 space-y-6 animate-pulse"
    >
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-orange-200 animate-spin" />
          <div className="h-4 w-48 bg-gray-200 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-100 rounded-xl" />
          <div className="h-8 w-24 bg-gray-100 rounded-xl" />
          <div className="h-8 w-24 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="h-8 w-32 bg-gray-300 rounded-md" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton: Fixed Heights (300px and 280px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Skeleton */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="h-5 w-40 bg-gray-300 rounded" />
              <div className="h-3 w-56 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-24 bg-emerald-100 rounded-lg" />
          </div>
          <div className="h-[300px] flex items-end justify-between gap-3 pt-6 px-2">
            {[45, 70, 30, 85, 60, 90, 50, 65].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[40px] bg-emerald-200/60 rounded-t-xl"
                />
                <div className="h-3 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart Skeleton */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-gray-300 rounded" />
              <div className="h-3 w-52 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-28 bg-orange-100 rounded-lg" />
          </div>
          <div className="h-[280px] flex items-end justify-between gap-3 pt-6 px-2">
            {[60, 40, 80, 50, 75, 95, 35, 65].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[40px] bg-orange-200/60 rounded-t-xl"
                />
                <div className="h-3 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="h-5 w-64 bg-gray-300 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
