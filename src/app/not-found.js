import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "404 - Page Not Found",
  description:
    "The page or dish you are looking for was moved, removed, or does not exist at Addis Eats.",
  openGraph: {
    title: "404 - Page Not Found | Addis Eats",
    description:
      "The page or dish you are looking for was moved, removed, or does not exist at Addis Eats.",
    url: "/404",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Page Not Found",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "404 - Page Not Found | Addis Eats",
    description:
      "The page or dish you are looking for was moved, removed, or does not exist at Addis Eats.",
    images: ["/images/addis-eats-og.jpg"],
  },
};

export default function NotFound() {
  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="section-headding mb-8 text-center">
          <span className="sub-title uppercase">404 Error</span>
          <h1 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
            Oops! Where are we?
          </h1>
        </div>

        {/* 404 Description & Actions */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-base leading-relaxed text-[#6b6f72]">
            Page not Found! The page or dish you are looking for was moved, removed,
            renamed, or might never have existed.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="button shadow-md">
              Back to Home
            </Link>
            <Link
              href="/menu"
              className="rounded border-2 border-dark px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:bg-dark hover:text-white"
            >
              Browse Menu
            </Link>
          </div>

          {/* 404 Image from template */}
          <div className="mt-12 flex justify-center">
            <Image
              src="/images/404.png"
              alt="Illustrated 404 error showing empty serving tray and lost directions"
              width={620}
              height={380}
              sizes="(max-width: 640px) 100vw, 620px"
              className="h-auto max-w-full"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
