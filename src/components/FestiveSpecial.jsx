import Image from "next/image";

export default function FestiveSpecial() {
  return (
    <section className="overflow-hidden bg-bg-grey">
      {/* Block 1: Right Image */}
      <div className="grid items-center lg:grid-cols-2">
        <div className="px-6 py-16 sm:px-12 sm:py-20 lg:py-24 lg:pl-16 lg:pr-12 xl:pl-28">
          <div className="max-w-xl">
            <div className="section-headding mb-6">
              <span className="sub-title uppercase">Festive special</span>
              <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
                Burger With Benefits
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-[#4b5563]">
              <p>
                Our signature Addis Burger is flame-grilled to order using premium lean beef, seasoned with our chef&apos;s mild house spices, and served on a fresh toasted brioche bun.
              </p>
              <p>
                Layered with ripe local tomatoes, crisp garden greens, caramelized onions, and our handcrafted tangy sauce, it is the ultimate gourmet comfort food.
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-full min-h-[360px] lg:min-h-[480px]">
          <Image
            src="/images/Our-Quality.jpg"
            alt="Gourmet handcrafted burger special loaded with fresh toppings"
            fill
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Block 2: Left Image */}
      <div className="grid items-center lg:grid-cols-2">
        <div className="relative order-2 h-full min-h-[360px] lg:order-1 lg:min-h-[480px]">
          <Image
            src="/images/Our-Quality-2.jpg"
            alt="Mega Cheese Pizza freshly stone baked with melted artisanal cheese"
            fill
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 px-6 py-16 sm:px-12 sm:py-20 lg:order-2 lg:py-24 lg:pl-12 lg:pr-16 xl:pr-28">
          <div className="max-w-xl">
            <div className="section-headding mb-6">
              <span className="sub-title uppercase">Party special</span>
              <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
                Mega Cheese Pizza
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-[#4b5563]">
              <p>
                Our Mega Cheese Pizza features a slow-fermented, stone-baked crust baked to golden perfection with rich herb-infused tomato marinara sauce.
              </p>
              <p>
                Generously topped with a molten blend of artisan mozzarella, mild gouda, and fresh basil, it is a crowd favorite for group gatherings and family celebrations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
