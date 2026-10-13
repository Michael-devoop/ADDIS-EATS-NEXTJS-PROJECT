import Link from "next/link";
import Image from "next/image";

export default function DishNotFound() {
  return (
    <section className="overflow-hidden bg-white pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="section-headding mb-8 text-center">
          <span className="sub-title uppercase">Dish Not Found</span>
          <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
            Oops! Dish Unavailable
          </h2>
        </div>

        <div className="mx-auto max-w-xl text-center">
          <p className="text-base leading-relaxed text-[#6b6f72]">
            The dish you requested could not be found. It may be temporarily sold out,
            renamed, or removed from today&apos;s menu.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/menu" className="button shadow-md">
              View Today&apos;s Menu
            </Link>
            <Link
              href="/"
              className="rounded border-2 border-dark px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:bg-dark hover:text-white"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-12 flex justify-center">
            <Image
              src="/images/404.png"
              alt="Illustrated empty plate graphic indicating dish is currently unavailable"
              width={540}
              height={330}
              sizes="(max-width: 640px) 100vw, 540px"
              className="h-auto max-w-full"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
