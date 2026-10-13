export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://addiseats.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/order-history",
          "/order-status",
          "/order-status/*",
          "/login",
          "/api/",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
