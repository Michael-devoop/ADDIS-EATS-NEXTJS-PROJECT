/**
 * Addis Eats - Server-Safe Site URL Resolver
 * Resolves the canonical site URL on the server without exposing
 * sensitive configuration in client-side JavaScript bundles (non-NEXT_PUBLIC).
 */
export function getSiteUrl() {
  const rawUrl =
    process.env.SITE_URL ||
    process.env.site_url ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://addis-eats-nextjs-project.vercel.app";

  // Strip trailing slashes for consistent URL concatenation
  return rawUrl.replace(/\/+$/, "");
}
