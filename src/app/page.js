import HomeBanner from "@/components/HomeBanner";
import AboutSection from "@/components/AboutSection";
import TopRecipes from "@/components/TopRecipes";
import ServicesSection from "@/components/ServicesSection";
import QuickReservation from "@/components/QuickReservation";
import InstagramSection from "@/components/InstagramSection";
import { getDishes, getCategories } from "@/data/menuData";

export const metadata = {
  title: "Authentic Ethiopian Restaurant & Cafe",
  description:
    "Experience the rich culinary heritage of Ethiopia at Addis Eats. Savor traditionally spiced dishes, freshly roasted coffee, and fast doorstep delivery.",
  openGraph: {
    title: "Addis Eats — Authentic Ethiopian Restaurant & Cafe",
    description:
      "Experience the rich culinary heritage of Ethiopia at Addis Eats. Savor traditionally spiced dishes, freshly roasted coffee, and fast doorstep delivery.",
    url: "/",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats - Authentic Ethiopian Dining Experience",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats — Authentic Ethiopian Restaurant & Cafe",
    description:
      "Experience the rich culinary heritage of Ethiopia at Addis Eats. Savor traditionally spiced dishes, freshly roasted coffee, and fast doorstep delivery.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

// Incremental Static Regeneration (ISR): Cache homepage on server for 1 hour
export const revalidate = 3600;

// Server Component fetching dish data in parallel using Promise.all()
export default async function HomePage() {
  const [allDishes, categories] = await Promise.all([
    getDishes(),
    getCategories(),
  ]);
  const topRecipes = allDishes.slice(0, 4);

  return (
    <>
      <HomeBanner />
      <AboutSection />
      <TopRecipes recipes={topRecipes} />
      <ServicesSection />
      <QuickReservation />
      <InstagramSection />
    </>
  );
}
