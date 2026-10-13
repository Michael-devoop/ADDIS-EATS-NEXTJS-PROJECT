import { Montserrat, Poppins } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { CartProvider } from "@/context/CartContext";
import SWRProvider from "@/components/SWRProvider";
import OrderStorageSync from "@/components/OrderStorageSync";
import { getSiteUrl } from "@/lib/siteUrl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const airbusSpecial = localFont({
  src: "./fonts/aispec.ttf",
  variable: "--font-airbus",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Addis Eats — Authentic Restaurant & Cafe",
    template: "%s | Addis Eats",
  },
  description: "We do not cook, we create your emotions! Fresh dishes delivered to your doorstep.",
  icons: {
    icon: "/images/fav-icon.png",
  },
  openGraph: {
    title: "Addis Eats — Authentic Restaurant & Cafe",
    description: "We do not cook, we create your emotions! Fresh dishes delivered to your doorstep.",
    url: "/",
    siteName: "Addis Eats",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats — Authentic Restaurant & Cafe",
    description: "We do not cook, we create your emotions! Fresh dishes delivered to your doorstep.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} ${airbusSpecial.variable}`}
    >
      <body
        className={`flex min-h-screen flex-col bg-white font-body text-[#4b5563] antialiased selection:bg-primary selection:text-white ${montserrat.variable} ${poppins.variable} ${airbusSpecial.variable}`}
      >
        <CartProvider>
          <OrderStorageSync />
          <SWRProvider>
            <SiteShell>{children}</SiteShell>
          </SWRProvider>
        </CartProvider>

        {/* Structured Restaurant Data - static JSON-LD with zero JavaScript runtime overhead */}
        <script
          id="restaurant-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Addis Eats",
              "image": `${getSiteUrl()}/images/ktfo.png`,
              "servesCuisine": ["Ethiopian", "African", "Traditional"],
              "priceRange": "$$",
              "telephone": "+251911002233",
              "openingHours": "Mo-Su 08:00-23:00"
            }),
          }}
        />

        {/* Optimized Analytics - loads lazily during browser idle time */}
        <Script
          id="addis-analytics"
          src="/scripts/analytics.js"
          strategy="lazyOnload"
        />

        {/* Optimized Guest Assistant Chat Widget - loads lazily during browser idle time */}
        <Script
          id="addis-chat-widget"
          src="/scripts/chat-widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
