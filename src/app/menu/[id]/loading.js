export default function DishDetailLoading() {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Dish Image Skeleton */}
          <div className="h-[420px] w-full animate-pulse rounded-xl bg-gray-200" />

          {/* Dish Details Skeleton */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-4 pt-2">
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-gray-100" />
              <div className="h-3.5 w-4/6 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="h-11 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-11 w-36 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
