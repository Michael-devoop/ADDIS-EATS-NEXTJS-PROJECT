import Link from "next/link";

/**
 * Accessible Empty State for Aggregated Analytics
 * Triggerable and demonstrable via ?demo=empty or when records are absent
 */
export default function AnalyticsEmptyState({ isDemonstration = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-white rounded-3xl p-10 sm:p-14 border border-dashed border-gray-200 text-center max-w-2xl mx-auto my-6 shadow-xs"
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-4xl shadow-inner shadow-orange-100">
        📭
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100/70 text-[#f95738] mb-2">
        {isDemonstration ? "Demonstration Mode Active" : "Empty Dataset"}
      </span>

      <h3 className="font-heading font-black text-xl sm:text-2xl text-[#111827]">
        No Aggregated Records Found
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-[#6b7280] leading-relaxed max-w-md mx-auto">
        There are currently no summarized daily transactions or order volume records
        matching your current query filters.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#f95738] px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#f95738]/30 hover:bg-[#ea580c] transition cursor-pointer"
        >
          <span>↺</span>
          <span>Reset to Live Production Data</span>
        </Link>

        <Link
          href="/admin/dashboard?demo=loading"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          <span>Test Loading State →</span>
        </Link>
      </div>
    </div>
  );
}
