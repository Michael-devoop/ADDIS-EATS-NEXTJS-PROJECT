"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Demonstrable Error State for Aggregated Analytics
 * Triggerable and demonstrable via ?demo=error or server aggregation failure.
 * Next.js App Router error boundary component.
 */
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log error for diagnostics
    console.error("Dashboard Aggregation Error Boundary caught:", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]"
    >
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-red-200/80 shadow-xl max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 text-4xl shadow-inner shadow-red-100">
          ⚠️
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
            Server Aggregation Failure (Demonstrable Error)
          </span>
          <h2 className="font-heading font-black text-2xl text-[#111827] mt-3">
            Failed to Aggregate Analytics
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {error?.message ||
              "An unexpected error occurred while computing order metrics on the server."}
          </p>
        </div>

        <div className="bg-red-50/60 rounded-2xl p-4 text-left border border-red-100 text-xs font-mono text-red-900 break-words">
          <strong>Error Code:</strong> SERVER_AGGREGATION_FAILED
          <br />
          <strong>Boundary:</strong> Server Page (RSC) → Client Leaf
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-2xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-sm shadow-red-600/30 hover:bg-red-700 transition cursor-pointer"
          >
            ↺ Retry Aggregation
          </button>

          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Return to Live Production Data
          </Link>
        </div>
      </div>
    </div>
  );
}
