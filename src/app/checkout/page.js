import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import PageBanner from "@/components/PageBanner";
import CheckoutForm from "@/components/CheckoutForm";
import { getLivePricing } from "@/lib/pricing";
import { getSession } from "@/lib/session";

// Force dynamic rendering per request
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description:
    "Complete your order with live pricing, dynamic delivery calculations, and secure checkout.",
  openGraph: {
    title: "Checkout | Addis Eats",
    description:
      "Complete your order with live pricing, dynamic delivery calculations, and secure checkout.",
    url: "/checkout",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Secure Checkout",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout | Addis Eats",
    description:
      "Complete your order with live pricing, dynamic delivery calculations, and secure checkout.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default async function CheckoutPage() {
  // Fetch independent session verification and live server pricing in parallel using Promise.all()
  const [cookieStore, livePricing] = await Promise.all([
    cookies(),
    getLivePricing(),
  ]);

  const verifiedSession = await getSession(cookieStore);

  // Defense-in-depth: redirect unauthenticated users if middleware was bypassed
  if (!verifiedSession || !verifiedSession.isAuthenticated) {
    redirect("/login?redirect=/checkout");
  }

  const sessionInfo = {
    sessionId: verifiedSession.sessionId,
    isAuthenticated: true,
    userEmail: verifiedSession.user?.email || null,
    userName: verifiedSession.user?.name || null,
  };

  return (
    <>
      <PageBanner
        title="Checkout"
        description="Complete your order with live kitchen pricing, dynamic delivery calculations, and secure checkout."
        breadcrumbs={[{ label: "Shop", href: "/menu" }, { label: "Checkout" }]}
      />
      <CheckoutForm sessionInfo={sessionInfo} livePricing={livePricing} />
    </>
  );
}
