"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { menuItems } from "@/data/menuData";
import { useMenu as useMenuContext } from "@/context/MenuContext";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/hooks/useMenu";
import { useMenuSearch } from "@/hooks/useMenuSearch";
import CacheIndicator from "@/components/CacheIndicator";

import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 4;

export default function MenuGrid({ dishes = menuItems }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { selectedCategory, setSelectedCategory, debouncedSearch, clearSearch } = useMenuContext();
  const { addItem } = useCart();

  // Instant client-side category filtering on dishes
  const categoryDishes =
    selectedCategory === "all"
      ? dishes
      : dishes.filter(
          (dish) =>
            Array.isArray(dish.categories) &&
            dish.categories.some(
              (c) => c.toLowerCase() === selectedCategory.toLowerCase()
            )
        );

  // Base menu hook — SWR caches dishes per category in the background
  const { data: menuData, isValidating: isMenuRefreshing } = useMenu({
    category: selectedCategory,
    fallbackData: {
      success: true,
      count: categoryDishes.length,
      dishes: categoryDishes,
    },
  });

  // Search hook — caches each search term under its own SWR key
  // Only fires when debouncedSearch is non-empty
  const { data: searchData } = useMenuSearch(debouncedSearch, {
    category: selectedCategory,
  });

  // Current category dish collection with guaranteed category isolation
  const rawDishes =
    (Array.isArray(menuData) ? menuData : menuData?.dishes) || dishes;

  const currentCategoryData =
    selectedCategory === "all"
      ? rawDishes
      : rawDishes.filter(
          (dish) =>
            Array.isArray(dish.categories) &&
            dish.categories.some(
              (c) => c.toLowerCase() === selectedCategory.toLowerCase()
            )
        );

  let activeDishes;
  if (debouncedSearch.trim()) {
    if (searchData) {
      activeDishes = Array.isArray(searchData) ? searchData : searchData.dishes || [];
    } else {
      // Instant cache search within the active category while SWR responds
      const q = debouncedSearch.toLowerCase().trim();
      activeDishes = currentCategoryData.filter(
        (dish) =>
          dish.name?.toLowerCase().includes(q) ||
          dish.desc?.toLowerCase().includes(q) ||
          (Array.isArray(dish.categories) &&
            dish.categories.some((c) => c.toLowerCase().includes(q)))
      );
    }
  } else {
    activeDishes = currentCategoryData;
  }

  const displayedDishes = activeDishes;

  // Pagination state driven locally to prevent Next.js RSC fetch requests on page change
  const [currentPage, setCurrentPage] = useState(1);

  // Sync initial page from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pageFromUrl = parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
      if (Number.isFinite(pageFromUrl) && pageFromUrl > 0) {
        setCurrentPage(pageFromUrl);
      }
    }
  }, []);

  // Reset to page 1 whenever category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch]);

  // Sync with browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const pageFromUrl = parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
      if (Number.isFinite(pageFromUrl) && pageFromUrl > 0) {
        setCurrentPage(pageFromUrl);
      } else {
        setCurrentPage(1);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const totalDishes = displayedDishes.length;
  const totalPages = Math.max(1, Math.ceil(totalDishes / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDishes = displayedDishes.slice(startIndex, endIndex);

  // Page navigation without triggering an RSC server fetch
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (pageNumber > 1) {
        params.set("page", String(pageNumber));
      } else {
        params.delete("page");
      }
      const newQuery = params.toString();
      const targetUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      window.history.pushState(null, "", targetUrl);
    }
  };

  return (
    <section className="bg-white pb-20 lg:pb-28">
      {/* Floating cache indicator (only shows during background refresh) */}
      <CacheIndicator isValidating={isMenuRefreshing && !debouncedSearch} />
      
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedDishes.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded bg-white shadow-[0_0_13px_1px_rgba(8,7,15,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative overflow-hidden">
                <Link
                  href={`/menu/${item.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt={`${item.name} - authentic dish served at Addis Eats`}
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-lg font-semibold text-dark">
                  <Link href={`/menu/${item.id}`} className="transition hover:text-primary">
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-[#4b5563]">
                  {item.desc}
                </p>
                <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xl font-bold text-primary">
                      {Math.round(Number(item.price) * 125.5).toLocaleString()} ETB
                    </span>
                    <Link
                      href={`/menu/${item.id}`}
                      aria-label={`View details and nutrition for ${item.name}`}
                      className="min-h-[44px] inline-flex items-center text-xs font-semibold uppercase text-dark hover:text-primary transition"
                    >
                      Details →
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    aria-label={`Add ${item.name} to cart`}
                    className="button min-h-[44px] w-full flex items-center justify-center !py-2.5 !text-xs font-bold uppercase tracking-wider shadow-sm transition hover:!bg-dark hover:!text-white"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayedDishes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-[#6b6f72] shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h4 className="font-heading text-lg font-bold uppercase text-dark">
              No Dishes Found
            </h4>
            <p className="mt-1 text-sm text-[#6b6f72]">
              {debouncedSearch
                ? `No dishes matched "${debouncedSearch}". Try a different keyword.`
                : "No dishes found in this category."}
            </p>
            {debouncedSearch && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-dark cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
            {selectedCategory !== "all" && !debouncedSearch && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-dark cursor-pointer"
                >
                  View All Dishes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls with Page Number in URL */}
        {totalPages > 1 && (
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            {/* Range Counter */}
            <p className="text-sm text-[#6b6f72]">
              Showing <span className="font-semibold text-dark">{startIndex + 1}</span>–
              <span className="font-semibold text-dark">
                {Math.min(endIndex, totalDishes)}
              </span>{" "}
              of <span className="font-semibold text-dark">{totalDishes}</span> dishes
            </p>

            {/* Page Navigation Links */}
            <nav
              aria-label="Menu Pagination"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white p-1.5 shadow-sm"
            >
              {/* Previous Button */}
              {safePage > 1 ? (
                <button
                  id="pagination-prev"
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  className="flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-dark transition hover:bg-gray-100 hover:text-primary cursor-pointer"
                  title="Previous Page"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
              ) : (
                <span
                  id="pagination-prev-disabled"
                  className="flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-gray-300 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </span>
              )}

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === safePage;
                return (
                  <button
                    key={pageNum}
                    id={`pagination-page-${pageNum}`}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-heading text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/25 font-bold"
                        : "text-dark hover:bg-gray-100 hover:text-primary"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              {safePage < totalPages ? (
                <button
                  id="pagination-next"
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  className="flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-dark transition hover:bg-gray-100 hover:text-primary cursor-pointer"
                  title="Next Page"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <span
                  id="pagination-next-disabled"
                  className="flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-gray-300 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
