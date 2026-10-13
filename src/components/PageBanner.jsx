import Link from "next/link";
import Image from "next/image";

export default function PageBanner({ title, description, breadcrumbs = [] }) {
  return (
    <section className="relative overflow-hidden bg-primary py-20 lg:py-24">
      {/* Background graphic optimized with Next.js Image */}
      <Image
        src="/images/sub-page-banner.png"
        alt=""
        fill
        priority
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="pointer-events-none object-cover opacity-30 -z-0"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          {/* Title & Description */}
          <div className="lg:col-span-8">
            <h1 className="font-heading text-3xl font-extrabold uppercase text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
                {description}
              </p>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="lg:col-span-4 lg:text-right">
            <nav aria-label="Breadcrumb">
              <ul className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
                <li>
                  <Link href="/" className="transition hover:text-dark">
                    Home
                  </Link>
                </li>
                {breadcrumbs.map((crumb, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="opacity-70">/</span>
                    {crumb.href ? (
                      <Link href={crumb.href} className="transition hover:text-dark">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/80">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
