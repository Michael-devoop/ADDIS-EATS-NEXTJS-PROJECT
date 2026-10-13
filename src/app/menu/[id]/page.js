import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDishes, getDish, getRelatedDishes } from "@/data/menuData";
import { getLivePricing } from "@/lib/pricing";
import AddToCartButton from "@/components/AddToCartButton";

// Revalidate dish detail pages every hour (3600 seconds)
export const revalidate = 3600;

// app/menu/[id]/page.js — every dish, at build time
// forty dishes -> forty static HTML files
export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getDish(id);
  if (!item) {
    return {
      title: "Dish Not Found",
      description: "The requested dish could not be found on our menu.",
    };
  }

  const formattedPrice = `${Math.round(Number(item.price) * 125.5).toLocaleString()} ETB`;

  return {
    title: `${item.name} - ${formattedPrice}`,
    description: `Order ${item.name} for ${formattedPrice} online from Addis Eats. ${item.desc || "Fresh authentic Ethiopian specialty dish prepared to order."}`,
    openGraph: {
      title: `${item.name} (${formattedPrice}) | Addis Eats`,
      description: `Order ${item.name} for ${formattedPrice} online from Addis Eats. Freshly prepared authentic Ethiopian specialty dish.`,
      url: `/menu/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} (${formattedPrice}) | Addis Eats`,
      description: `Order ${item.name} for ${formattedPrice} online from Addis Eats.`,
    },
    alternates: {
      canonical: `/menu/${id}`,
    },
  };
}

export default async function MenuItemPage({ params }) {
  const { id } = await params;

  // Fetch independent dish data, related dishes, and live pricing in parallel
  const [item, relatedDishes, livePricing] = await Promise.all([
    getDish(id),
    getRelatedDishes(id),
    getLivePricing(),
  ]);

  if (!item) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://addiseats.com";
  const etbPrice = (item.price * livePricing.etbExchangeRate).toFixed(2);
  const dishImageUrl = item.image.startsWith("http")
    ? item.image
    : `${siteUrl}${item.image.startsWith("/") ? "" : "/"}${item.image}`;

  // Structured Data: Schema.org MenuItem JSON-LD
  const menuItemJsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: item.name,
    description: item.desc || `${item.name} prepared fresh to order at Addis Eats.`,
    image: dishImageUrl,
    url: `${siteUrl}/menu/${item.id}`,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: etbPrice,
      priceCurrency: "ETB",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/menu/${item.id}`,
      seller: {
        "@type": "Restaurant",
        name: "Addis Eats",
        url: siteUrl,
      },
    },
    category: item.categories.join(", "),
  };

  return (
    <section className="bg-white pb-20 lg:pb-28">
      {/* Schema.org MenuItem Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(menuItemJsonLd),
        }}
      />

      <div className="container mx-auto px-4">
        {/* Navigation Breadcrumb Bar */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wider text-primary transition hover:text-dark"
          >
            ← Back to all dishes
          </Link>
          <div className="text-xs text-[#6b6f72]">
            <span>Menu</span>
            <span className="mx-2">/</span>
            <span className="capitalize">{item.categories.join(", ")}</span>
            <span className="mx-2">/</span>
            <strong className="text-dark">{item.name}</strong>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Dish Image */}
          <div className="overflow-hidden rounded-xl bg-gray-50 shadow-lg">
            <Image
              src={item.image}
              alt={`${item.name} - freshly made authentic Ethiopian specialty dish`}
              width={600}
              height={500}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Dish Details */}
          <div className="flex flex-col justify-center">
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              {item.categories.join(" • ")}
            </span>

            <h2 className="font-heading mt-2 text-3xl font-bold uppercase text-dark sm:text-4xl">
              {item.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-3xl font-extrabold text-primary">
                {Math.round(Number(etbPrice)).toLocaleString()} ETB
              </span>
              <span className="text-sm text-gray-400 line-through">
                {Math.round(Number(etbPrice) * 1.2).toLocaleString()} ETB
              </span>
            </div>

            {/* Star Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-sm text-[#ffc107]">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-[#6b6f72]">(8 Reviews)</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-[#6b6f72]">
              {item.desc}. Handcrafted using authentic Ethiopian spices and fresh seasonal ingredients, served hot and prepared to order at Addis Eats.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddToCartButton item={item} />
              <Link
                href="/menu"
                className="rounded border-2 border-dark px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:bg-dark hover:text-white"
              >
                Back to Menu
              </Link>
            </div>

            <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-[#6b6f72] space-y-2">
              <p>
                <strong className="text-dark">Category:</strong>{" "}
                {item.categories.join(", ")}
              </p>
              <p>
                <strong className="text-dark">Availability:</strong> Fresh in stock
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
