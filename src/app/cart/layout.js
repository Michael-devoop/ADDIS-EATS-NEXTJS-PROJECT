export const metadata = {
  title: "Shopping Cart",
  description:
    "Review your selected Ethiopian dishes, adjust quantities, calculate doorstep delivery, and proceed to secure checkout.",
  openGraph: {
    title: "Shopping Cart | Addis Eats",
    description:
      "Review your selected Ethiopian dishes, adjust quantities, calculate doorstep delivery, and proceed to secure checkout.",
    url: "/cart",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Shopping Cart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopping Cart | Addis Eats",
    description:
      "Review your selected Ethiopian dishes, adjust quantities, calculate doorstep delivery, and proceed to secure checkout.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/cart",
  },
};

export default function CartLayout({ children }) {
  return children;
}
