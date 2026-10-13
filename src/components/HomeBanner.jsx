import Link from "next/link";
import Image from "next/image";

export default function HomeBanner() {
  return (
    <section
      className="home-banner relative overflow-hidden bg-white bg-[linear-gradient(to_right,#f0f4f4_1px,transparent_1px),linear-gradient(to_bottom,#f0f4f4_1px,transparent_1px)] bg-[size:100px_100px] pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-6 lg:pb-20"
    >

      {/* Top-left organic green blob - lazy loaded decorative element */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 w-24 sm:w-36 md:w-48 lg:w-56" aria-hidden="true">
        <Image
          src="/images/home-top-left.png"
          alt=""
          width={220}
          height={200}
          loading="lazy"
          fetchPriority="low"
          sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 224px"
          className="h-auto w-full object-contain"
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* Top-right organic green blob - lazy loaded decorative element */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 w-28 sm:w-40 md:w-52 lg:w-[360px] opacity-90" aria-hidden="true">
        <Image
          src="/images/home-top-right.png"
          alt=""
          width={589}
          height={431}
          loading="lazy"
          fetchPriority="low"
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 208px, 360px"
          className="h-auto w-full opacity-80"
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* Bottom-left floating garnish leaf - lazy loaded decorative element */}
      <div className="pointer-events-none absolute left-2 sm:left-4 bottom-14 sm:bottom-18 lg:bottom-6 z-20 w-8 sm:w-12 lg:w-[120px]" aria-hidden="true">
        <Image
          src="/images/home-bottom-left.png"
          alt=""
          width={209}
          height={236}
          loading="lazy"
          fetchPriority="low"
          sizes="(max-width: 640px) 32px, (max-width: 1024px) 48px, 120px"
          className="h-auto w-full"
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="grid items-center gap-8 lg:gap-10 lg:grid-cols-2">
          {/* Banner content: painted immediately without opacity-delay animation for optimal LCP */}
          <div className="relative z-10 text-center lg:text-left">
            <h1 className="font-airbus font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-extrabold uppercase leading-tight lg:leading-[1.18] text-dark">
              We do not <span className="text-primary">cook</span>, we create your emotions!
            </h1>
            <p className="mt-4 sm:mt-5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-6 sm:leading-7 text-[#4b5563]">
              Experience authentic Ethiopian heritage dishes, sizzling platters, and spices delivered fresh to your doorstep.
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
              <Link
                href="/menu"
                className="button inline-block shadow-md hover:shadow-lg uppercase font-heading font-bold !px-8 !py-3 text-sm sm:text-base tracking-wider"
              >
                See Our Menu
              </Link>
            </div>
          </div>

          {/* Banner plate image: High Priority LCP Element */}
          <div className="relative z-10 flex justify-center mt-0 lg:mt-0">
            <Image
              src="/images/ktfo.png"
              alt="Traditional Ethiopian Kitfo seasoned beef delicacy served on an authentic platter"
              width={387}
              height={425}
              priority
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 440px"
              className="h-auto w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px]"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

        {/* Decorative animation images for desktop - lazy loaded */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          {/* Top-center garnish */}
          <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-[8%] max-w-[100px]">
            <Image
              src="/images/home-top-center.png"
              alt=""
              width={160}
              height={150}
              loading="lazy"
              fetchPriority="low"
              sizes="100px"
              className="h-auto w-full"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* Bottom-right element */}
          <div className="absolute right-[22%] -bottom-4 w-[31%] max-w-[360px]">
            <Image
              src="/images/home-bottom-right.png"
              alt=""
              width={589}
              height={449}
              loading="lazy"
              fetchPriority="low"
              sizes="360px"
              className="h-auto w-full opacity-80"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* Bottom-right-2 small floating garnish */}
          <div className="absolute right-12 bottom-0 w-[8%] max-w-[90px]">
            <Image
              src="/images/home-bottom-right-2.png"
              alt=""
              width={151}
              height={154}
              loading="lazy"
              fetchPriority="low"
              sizes="90px"
              className="h-auto w-full"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
