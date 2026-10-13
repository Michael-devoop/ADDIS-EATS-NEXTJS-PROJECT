"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/hooks/useMenu";

const fallbackDefaultRecipes = [
  {
    id: "fast-platter",
    name: "Fast Platter",
    image: "/images/recipe-1.jpg",
    desc: "A mighty meaty double helping of all the reasons you love",
    price: 66.7,
  },
  {
    id: "fried-drumstick",
    name: "Fried Drumstick",
    image: "/images/recipe-2.jpg",
    desc: "A mighty meaty double helping of all the reasons you love",
    price: 65.77,
  },
  {
    id: "special-poha",
    name: "Special Poha",
    image: "/images/recipe-3.jpg",
    desc: "A mighty meaty double helping of all the reasons you love",
    price: 75.88,
  },
  {
    id: "adana-kabab",
    name: "Adana Kabab",
    image: "/images/recipe-4.jpg",
    desc: "A mighty meaty double helping of all the reasons you love",
    price: 26.2,
  },
];

export default function TopRecipes({ recipes: initialRecipes = [] }) {
  const { addItem } = useCart();

  // Connect to SWR memory cache:
  // - First render: Instantly uses server-preloaded initialRecipes (zero CLS & instant LCP)
  // - Subsequent visits: Instantly served from client memory cache (0-10ms)
  // - Background: Silently checks for updates with SWR stale-while-revalidate
  const { data } = useMenu({
    limit: 4,
    fallbackData:
      initialRecipes && initialRecipes.length > 0
        ? { success: true, count: initialRecipes.length, dishes: initialRecipes }
        : undefined,
  });

  const rawDishes =
    data?.dishes ||
    data?.menu ||
    (Array.isArray(data) ? data : null) ||
    initialRecipes;

  const itemsToDisplay =
    rawDishes && rawDishes.length > 0
      ? rawDishes.slice(0, 4)
      : fallbackDefaultRecipes;

  return (
    <section className="bg-bg-grey py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="section-headding mb-12 text-center">
          <span className="sub-title uppercase">Top Recipes</span>
          <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
            Our Special Dish
          </h2>
        </div>

        {/* Recipes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {itemsToDisplay.map((item) => {
            const numericPrice =
              typeof item.price === "number"
                ? item.price
                : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;

            const displayPrice = `${Math.round(numericPrice * 125.5).toLocaleString()} ETB`;

            return (
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
                      alt={`${item.name} - freshly prepared Ethiopian specialty dish`}
                      width={400}
                      height={300}
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-semibold text-dark">
                    <Link
                      href={`/menu/${item.id}`}
                      className="transition hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#4b5563]">
                    {item.desc}
                  </p>
                  <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xl font-bold text-primary">
                        {displayPrice}
                      </span>
                      <Link
                        href={`/menu/${item.id}`}
                        aria-label={`View details and nutrition for ${item.name}`}
                        className="min-h-[44px] inline-flex items-center text-xs font-semibold uppercase text-dark hover:text-primary transition"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: numericPrice,
                          image: item.image,
                          desc: item.desc,
                        })
                      }
                      aria-label={`Add ${item.name} to cart`}
                      className="button min-h-[44px] w-full flex items-center justify-center !py-2.5 !text-xs font-bold uppercase tracking-wider shadow-sm transition hover:!bg-dark hover:!text-white"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Menu CTA */}
        <div className="mt-14 text-center">
          <Link href="/menu" className="button">
            View Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
