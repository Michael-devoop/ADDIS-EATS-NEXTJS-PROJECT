import PageBanner from "@/components/PageBanner";
import ContactForm from "@/components/ContactForm";

// Incremental Static Regeneration (ISR): Cache contact page on server for 1 hour
export const revalidate = 3600;

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Addis Eats. Reserve tables, inquire about events and private dining, or find our authentic Ethiopian restaurant location in Addis Ababa.",
  openGraph: {
    title: "Contact Us | Addis Eats",
    description:
      "Get in touch with Addis Eats. Reserve tables, inquire about events and private dining, or find our authentic Ethiopian restaurant location in Addis Ababa.",
    url: "/contact",
    images: [
      {
        url: "/images/addis-eats-og.jpg",
        width: 1200,
        height: 630,
        alt: "Addis Eats Contact & Location",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Addis Eats",
    description:
      "Get in touch with Addis Eats. Reserve tables, inquire about events and private dining, or find our authentic Ethiopian restaurant location in Addis Ababa.",
    images: ["/images/addis-eats-og.jpg"],
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        description="We'd love to hear from you. Reach out for reservations, private dining, catering inquiries, or feedback."
        breadcrumbs={[{ label: "Pages" }, { label: "Contact Us" }]}
      />

      <section className="bg-[#fafafa] py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Contact Details Cards */}
          <div className="mb-14 grid gap-8 md:grid-cols-3">
            {/* Address Card */}
            <div className="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-dark">Location</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                Bole Medhanialem Road, St. 4<br />
                Addis Ababa, Ethiopia
              </p>
              <span className="mt-4 text-xs font-semibold uppercase text-primary">
                Opposite Edna Mall
              </span>
            </div>

            {/* Phone & Hours Card */}
            <div className="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-dark">Phone & Hours</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                +251 911 00 22 33<br />
                +251 116 18 22 33
              </p>
              <span className="mt-4 text-xs font-semibold uppercase text-primary">
                Mon - Sun: 08:00 AM - 11:00 PM
              </span>
            </div>

            {/* Email Card */}
            <div className="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold uppercase text-dark">Email Support</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                reservations@addiseats.com<br />
                support@addiseats.com
              </p>
              <span className="mt-4 text-xs font-semibold uppercase text-primary">
                Replies within 2 hours
              </span>
            </div>
          </div>

          {/* Form & Map Grid */}
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Location & Map Information */}
            <div className="flex flex-col justify-between rounded-lg bg-white p-8 shadow-[0_0_20px_rgba(0,0,0,0.06)] sm:p-10 lg:col-span-5">
              <div>
                <span className="sub-title uppercase">Find Us</span>
                <h3 className="font-heading text-2xl font-bold uppercase text-dark">
                  Visit Our Kitchen
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">
                  Conveniently situated in the bustling heart of Bole, Addis Eats invites you to experience Ethiopian warmth, aromatic spices, and traditional hospitality. Ample guest parking is available.
                </p>

                <div className="mt-6 space-y-3 rounded bg-bg-grey p-5 text-sm text-[#4b5563]">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-dark">City:</span> Addis Ababa
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-dark">Subcity:</span> Bole Sub-City, Woreda 03
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-dark">Delivery Radius:</span> All sub-cities within Addis Ababa
                  </div>
                </div>
              </div>

              {/* Map embed placeholder / visual location map */}
              <div className="mt-6 overflow-hidden rounded border border-gray-200">
                <iframe
                  title="Addis Eats Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15762.610660601815!2d38.775833!3d8.998611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x6b872ef74f177c8e!2sBole%2C%20Addis%20Ababa!5e0!3m2!1sen!2set!4v1710000000000!5m2!1sen!2set"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
