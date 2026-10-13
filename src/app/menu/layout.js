import PageBanner from "@/components/PageBanner";
import { MenuProvider } from "@/context/MenuContext";

export const metadata = {
  title: "Our Menu",
  description:
    "Explore authentic Ethiopian specialties, chef platters, starters, sizzling mains, and refreshing drinks prepared fresh at Addis Eats.",
  openGraph: {
    title: "Our Menu | Addis Eats",
    description:
      "Explore authentic Ethiopian specialties, chef platters, starters, sizzling mains, and refreshing drinks prepared fresh at Addis Eats.",
    url: "/menu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Menu | Addis Eats",
    description:
      "Explore authentic Ethiopian specialties, chef platters, starters, sizzling mains, and refreshing drinks prepared fresh at Addis Eats.",
  },
  alternates: {
    canonical: "/menu",
  },
};

// Refresh menu every hour (3600 seconds) using ISR (Incremental Static Regeneration)
export const revalidate = 3600;

export default function MenuLayout({ children }) {
  return (
    <MenuProvider>
      <PageBanner
        title="Our Menu"
        description="Discover our delicious menus of the day: Starters, Main Dishes, Drinks, and Desserts freshly made for you."
        breadcrumbs={[{ label: "Menu" }]}
      />
      {children}
    </MenuProvider>
  );
}
