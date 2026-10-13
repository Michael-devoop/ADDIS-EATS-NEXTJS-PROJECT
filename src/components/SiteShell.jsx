"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

/**
 * SiteShell dynamically wraps pages:
 * For customer routes: renders standard Header and Footer.
 * For /admin routes: bypasses customer Header and Footer so Admin gets its own dedicated layout.
 */
export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div id="admin-shell" className="min-h-screen bg-[#f4f5f7]">
        {children}
      </div>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 pb-20 lg:pb-0 outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
