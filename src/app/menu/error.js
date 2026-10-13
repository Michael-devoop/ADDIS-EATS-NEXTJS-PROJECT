"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MenuError({ error, reset }) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Menu segment error caught by error boundary:", error);
  }, [error]);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-[#fffbfa] p-8 shadow-sm sm:p-10">
          {/* Warning Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <span className="font-heading text-xs font-semibold uppercase tracking-wider text-red-600">
            Error In Menu Segment
          </span>

          <h2 className="font-heading mt-2 text-2xl font-bold uppercase text-dark sm:text-3xl">
            Something Went Wrong
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#6b6f72]">
            We encountered an unexpected problem while loading the menu. Please try reloading the
            segment or return to the home page.
          </p>

          {error?.message && (
            <div className="mt-4 rounded bg-red-50 p-3 text-left font-mono text-xs text-red-800">
              <span className="font-bold">Details:</span> {error.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="button shadow-md"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded border-2 border-dark px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:bg-dark hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
