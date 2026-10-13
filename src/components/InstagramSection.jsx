import Image from "next/image";

const items = [
  { image: "/images/instagram-1.jpg", label: "Pizza" },
  { image: "/images/instagram-2.jpg", label: "Rice" },
  { image: "/images/instagram-3.jpg", label: "Burger" },
  { image: "/images/instagram-4.jpg", label: "Fast Platter" },
  { image: "/images/instagram-5.jpg", label: "Veg Sandwich" },
];

export default function InstagramSection() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {items.map((item, idx) => (
          <div key={idx} className="group relative block overflow-hidden">
            <Image
              src={item.image}
              alt={`Instagram culinary highlight of ${item.label}`}
              width={360}
              height={360}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-[#08070f]/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* Floating label */}
            <span className="font-heading pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-lg font-bold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
