import { getDishes } from "@/data/menuData";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://addiseats.com";
  const dishes = await getDishes();

  // Dynamic dish records from the catalog
  const dishUrls = dishes.map((dish) => ({
    url: `${baseUrl}/menu/${dish.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Public indexable routes (excluding private routes: /cart, /checkout, /order-history, /order-status, /login, /api/*)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...dishUrls,
  ];
}
