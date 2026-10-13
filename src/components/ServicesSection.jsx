import Image from "next/image";

const services = [
  {
    icon: "/images/Fast-Delivery.png",
    title: "Fast Delivery",
    desc: "Fresh, hot meals delivered promptly to your home or office with express courier tracking.",
  },
  {
    icon: "/images/Limitless-Order.png",
    title: "Limitless Order",
    desc: "Order as much as you crave for family dinners, meetings, or celebrations with no dish caps.",
  },
  {
    icon: "/images/Premium-Quality.png",
    title: "Premium Quality",
    desc: "Carefully sourced organic ingredients and authentic Ethiopian spices crafted by seasoned chefs.",
  },
  {
    icon: "/images/Always-Fresh.png",
    title: "Always Fresh",
    desc: "Prepared fresh-to-order with farm-to-table seasonal produce and authentic local traditions.",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background graphic */}
      <div className="pointer-events-none absolute left-0 top-1/2 -z-10 -translate-y-1/2 opacity-25">
        <Image
          src="/images/service-bg.png"
          alt=""
          width={324}
          height={451}
          loading="lazy"
          sizes="(max-width: 1024px) 150px, 324px"
          style={{ width: "auto", height: "auto" }}
          aria-hidden="true"
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Heading */}
          <div className="section-headding mb-14 text-center">
            <span className="sub-title uppercase">Our Services</span>
            <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
              As Fast As Than You Expect
            </h2>
          </div>

          {/* Services Grid (4 Columns) */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col items-center rounded-lg bg-white p-7 text-center shadow-[0_0_15px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={item.icon}
                    alt={`${item.title} service icon`}
                    width={56}
                    height={56}
                    sizes="56px"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
                <h3 className="font-heading mb-3 text-xl font-bold text-dark transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#4b5563]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
