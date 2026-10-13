import Link from "next/link";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="about overflow-hidden py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Collage of Images */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-[500px] lg:max-w-none">
              {/* Main right image */}
              <div className="ml-auto w-3/4 overflow-hidden rounded shadow-lg translate-x-4 sm:translate-x-6 lg:translate-x-8">
                <Image
                  src="/images/dulet.png"
                  alt="Savory Ethiopian Dulet specialty minced meat dish seasoned with herbs"
                  width={475}
                  height={545}
                  sizes="(max-width: 640px) 75vw, (max-width: 1024px) 380px, 475px"
                  className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>

              {/* Overlapping top-left image */}
              <div className="absolute -left-2 -top-8 w-1/2 overflow-hidden rounded border-8 border-white shadow-xl sm:-left-6 sm:-top-12">
                <Image
                  src="/images/ktfo1.png"
                  alt="Traditional Ethiopian Kitfo delicacy served on injera platter"
                  width={367}
                  height={404}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 250px, 367px"
                  className="h-auto w-full object-cover"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>

              {/* Rotating decorative ring */}
              <div className="pointer-events-none absolute -bottom-6 -left-6 z-10 w-24 sm:-bottom-10 sm:-left-10 sm:w-32">
                <Image
                  src="/images/about-ring.png"
                  alt="Rotating traditional geometric accent ring"
                  width={191}
                  height={188}
                  sizes="(max-width: 640px) 96px, 128px"
                  className="animate-spin-slow h-auto w-full"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="order-1 lg:order-2">
            <div className="section-headding mb-6">
              <span className="sub-title uppercase">Our Story</span>
              <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
                About Us
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-[#4b5563]">
              <p>
                Founded in the vibrant heart of Addis Ababa, Addis Eats was born out of a deep
                passion for authentic Ethiopian culinary heritage and warm communal hospitality.
                From slow-simmered rich stews infused with hand-ground berbere spices to freshly
                baked, spongy teff injera, every recipe carries generations of time-honored tradition.
              </p>
              <p>
                We believe that sharing a meal around a traditional mesob is more than just dining—it
                is a heartfelt celebration of togetherness (gursha), rich cultural aromas, and genuine
                connection. Whether you are savoring our sizzling beef tibs, delicately spiced shiro,
                or signature coffee ceremony, each dish is handcrafted with fresh, locally sourced
                ingredients and culinary excellence.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/about-us" className="button">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
