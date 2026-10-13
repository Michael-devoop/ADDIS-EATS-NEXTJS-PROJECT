"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { menuTabs } from "@/data/menuData";
import { useMenu } from "@/context/MenuContext";

export default function CategoryBar({ tabs = menuTabs }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    commitSearchImmediately,
    clearSearch,
    isDebouncing,
  } = useMenu();

  // Sync initial query and category from URL on mount
  const hasInitializedFromUrl = useRef(false);
  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    hasInitializedFromUrl.current = true;

    const urlQuery = searchParams.get("search") || searchParams.get("q");
    const urlCategory = searchParams.get("category");

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }

    if (urlQuery) {
      if (commitSearchImmediately) {
        commitSearchImmediately(urlQuery);
      } else {
        setSearchQuery(urlQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for browser Back / Forward buttons (popstate) to keep category in sync
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlCategory = params.get("category") || "all";
      const urlQuery = params.get("search") || params.get("q") || "";
      setSelectedCategory(urlCategory);
      if (commitSearchImmediately) {
        commitSearchImmediately(urlQuery);
      } else {
        setSearchQuery(urlQuery);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [commitSearchImmediately, setSelectedCategory, setSearchQuery]);

  // Sync debounced search query to URL without triggering an RSC server fetch
  useEffect(() => {
    if (!hasInitializedFromUrl.current) return;
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
      params.delete("q");
    }
    const newQuery = params.toString();
    const targetUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    window.history.replaceState(null, "", targetUrl);
  }, [debouncedSearch, pathname]);

  const handleTabClick = (categoryId) => {
    setSelectedCategory(categoryId);
    // Clear any active search query when changing categories so the category dishes are displayed
    if (searchQuery) {
      clearSearch();
    }

    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("q");
    params.delete("page");

    if (categoryId && categoryId !== "all") {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }

    const newQuery = params.toString();
    const targetUrl = newQuery ? `${pathname}?${newQuery}` : pathname;

    // Use window.history.pushState instead of router.push.
    // This completely cancels/prevents Next.js from sending the redundant RSC request (menu?category=...&_rsc=...)
    window.history.pushState(null, "", targetUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (commitSearchImmediately) {
        commitSearchImmediately(searchQuery);
      }
    }
  };

  return (
    <section className="bg-white pt-16 pb-6 lg:pt-20 lg:pb-8">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="section-headding mb-6 text-center">
          <span className="sub-title uppercase">Delicious</span>
          <h1 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
            Menus Of The Day
          </h1>
        </div>

        {/* Menu Search Bar with Debounce & SWR Cache */}
        <div className="mx-auto mb-8 max-w-xl">
          <div className="relative flex items-center">
            {/* Search Icon */}
            <div className="pointer-events-none absolute left-4 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Debounced Input */}
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search dishes by name or ingredients (e.g. Kitfo, Burger, Shiro)..."
              aria-label="Search dishes by name or ingredients"
              className="w-full rounded-2xl border-2 border-gray-100 bg-[#f9faf7] py-3.5 pl-12 pr-12 text-sm text-dark placeholder-gray-400 outline-none transition focus:border-primary focus:bg-white focus:shadow-sm"
            />

            {/* Typing / Debouncing Indicator */}
            {isDebouncing && (
              <div
                className="pointer-events-none absolute right-12 flex items-center gap-1.5 text-xs text-primary"
                aria-live="polite"
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="hidden sm:inline text-[11px] text-gray-400">Typing...</span>
              </div>
            )}

            {/* Clear button with 44px accessible touch target */}
            {searchQuery && (
              <button
                id="menu-search-clear"
                type="button"
                onClick={clearSearch}
                aria-label="Clear search query"
                className="absolute right-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-base font-bold text-gray-500 transition hover:bg-primary hover:text-white cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs with 44px accessible touch target */}
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`menu-tab-${tab.id}`}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`min-h-[44px] cursor-pointer rounded px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "bg-[#f5f5f5] text-dark hover:bg-primary hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
