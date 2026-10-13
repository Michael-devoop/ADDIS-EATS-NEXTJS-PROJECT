export default function DishSkeleton() {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        {/* Skeleton Dish Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded bg-white shadow-[0_0_13px_1px_rgba(8,7,15,0.06)]"
            >
              {/* Image placeholder */}
              <div className="h-60 w-full animate-pulse bg-gray-200" />

              {/* Text placeholders */}
              <div className="flex flex-1 flex-col p-5 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
