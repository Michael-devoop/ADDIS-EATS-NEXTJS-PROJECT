import { Suspense } from "react";
import CategoryBar from "@/components/CategoryBar";
import DishList from "@/components/DishList";
import DishSkeleton from "@/components/DishSkeleton";
import FestiveSpecial from "@/components/FestiveSpecial";
import ServicesSection from "@/components/ServicesSection";
import { getDishes, getCategories } from "@/data/menuData";
import { getSiteUrl } from "@/lib/siteUrl";

// Refresh menu every hour (3600 seconds) using ISR (Incremental Static Regeneration)
export const revalidate = 3600;

// Server Component fetching independent data in parallel using Promise.all()
export default async function MenuPage() {
  // Fetch independent datasets in parallel to eliminate waterfalls
  const [dishes, tabs] = await Promise.all([
    getDishes(),
    getCategories(),
  ]);

  // Prepare data on the server
  const preparedDishes = dishes.map((dish) => ({
    ...dish,
    formattedPrice: `${Math.round(dish.price * 125.5).toLocaleString()} ETB`,
  }));

  const siteUrl = getSiteUrl();
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Addis Eats Restaurant Menu",
    description: "Authentic Ethiopian specialties, starters, sizzling mains, and drinks.",
    url: `${siteUrl}/menu`,
    hasMenuItem: dishes.map((dish) => ({
      "@type": "MenuItem",
      name: dish.name,
      description: dish.desc || `${dish.name} prepared fresh at Addis Eats.`,
      image: dish.image.startsWith("http") ? dish.image : `${siteUrl}${dish.image}`,
      url: `${siteUrl}/menu/${dish.id}`,
      offers: {
        "@type": "Offer",
        price: (dish.price * 125.5).toFixed(2),
        priceCurrency: "ETB",
        availability: "https://schema.org/InStock",
      },
    })),
  };

  return (
    <>
      {/* Schema.org Menu Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(menuJsonLd),
        }}
      />

      {/* Pass server data to Client Component via props */}
      <Suspense fallback={null}>
        <CategoryBar tabs={tabs} />
      </Suspense>
      <Suspense fallback={<DishSkeleton />}>
        {/* Pass server data to streamed component via props */}
        <DishList dishes={preparedDishes} />
      </Suspense>
      <FestiveSpecial />
      <ServicesSection />
    </>
  );
}
