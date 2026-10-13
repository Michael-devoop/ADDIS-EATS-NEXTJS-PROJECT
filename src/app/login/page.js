import { Suspense } from "react";
import { redirect } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login",
  description:
    "Sign in to your Addis Eats account to track live orders, review history, and manage your session.",
  openGraph: {
    title: "Login | Addis Eats",
    description:
      "Sign in to your Addis Eats account to track live orders, review history, and manage your session.",
    url: "/login",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Member Login",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Addis Eats",
    description:
      "Sign in to your Addis Eats account to track live orders, review history, and manage your session.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  // If already authenticated and visiting with an intentional redirect (e.g. /checkout),
  // forward them directly only if they have the required role and aren't switching accounts
  if (session?.isAuthenticated && resolvedSearchParams?.redirect && !resolvedSearchParams?.switch) {
    const isTargetingAdmin = resolvedSearchParams.redirect.startsWith("/admin");
    const isAdmin = session.user?.role === "admin";

    // Only auto-redirect if they satisfy permission for target destination
    if (!isTargetingAdmin || isAdmin) {
      redirect(resolvedSearchParams.redirect);
    }
  }

  return (
    <>
      <PageBanner
        title="Login"
        description="Sign in to your Addis Eats account to track live orders, review history, and enjoy authentic dining."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pages" },
          { label: "Login" },
        ]}
      />
      <Suspense fallback={<div className="py-20 text-center text-sm text-[#6b6f72]">Loading login portal...</div>}>
        <LoginForm initialSession={session} />
      </Suspense>
    </>
  );
}
