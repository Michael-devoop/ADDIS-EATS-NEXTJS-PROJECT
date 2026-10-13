"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="hidden lg:block bg-primary text-white">
      <div className="container mx-auto px-4 py-20 lg:py-24">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Logo & Social */}
          <div>
            <Link href="/" className="mb-6 inline-block rounded-xl bg-white px-3.5 py-2 shadow-xs transition hover:bg-white/95">
              <Image
                src="/images/logoimage-cropped.png"
                alt="Addis Eats Restaurant Brand Logo"
                width={150}
                height={42}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-6 text-white/90">
              Authentic Ethiopian culinary flavors, fresh injera, sizzling prime specialties, and fast delivery across Addis Ababa.
            </p>
            <ul className="mt-6 flex items-center gap-3">
              <li>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary transition duration-300 hover:bg-dark hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary transition duration-300 hover:bg-dark hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary transition duration-300 hover:bg-dark hover:text-white"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Hours & Phone */}
          <div className="space-y-6">
            <div>
              <h3 className="font-heading relative mb-5 pb-3 text-lg font-semibold uppercase tracking-wider text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-white">
                Opening Hours
              </h3>
              <ul className="space-y-1 text-sm text-white/90">
                <li>Monday - Friday</li>
                <li>10.00 AM - 11.00 PM</li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading relative mb-5 pb-3 text-lg font-semibold uppercase tracking-wider text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-white">
                Phone
              </h3>
              <ul>
                <li>
                  <a
                    href="tel:+251911234567"
                    className="text-sm text-white/90 transition hover:text-dark"
                  >
                    +251 911 234 567
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Address & Email */}
          <div className="space-y-6">
            <div>
              <h3 className="font-heading relative mb-5 pb-3 text-lg font-semibold uppercase tracking-wider text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-white">
                Address
              </h3>
              <p className="text-sm leading-relaxed text-white/90">
                Bole Medhanialem, Edna Mall Area, Addis Ababa, Ethiopia
              </p>
            </div>
            <div>
              <h3 className="font-heading relative mb-5 pb-3 text-lg font-semibold uppercase tracking-wider text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-white">
                Email
              </h3>
              <a
                href="mailto:contact@addiseats.com"
                className="text-sm text-white/90 transition hover:text-dark"
              >
                contact@addiseats.com
              </a>
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h3 className="font-heading relative mb-5 pb-3 text-lg font-semibold uppercase tracking-wider text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-white">
              Newsletter
            </h3>
            {subscribed ? (
              <p className="rounded bg-white/20 p-4 text-xs font-semibold text-white">
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  aria-label="Email Address for Newsletter"
                  required
                  className="w-full bg-white px-4 py-3 text-sm text-dark placeholder-[#979a9d] outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-none bg-white py-3 text-center font-heading text-xs font-bold uppercase tracking-wider text-primary shadow transition hover:bg-dark hover:text-white"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 py-6 text-center text-xs text-white/90">
        <div className="container mx-auto px-4">
          <p>
            © {new Date().getFullYear()} Addis Eats Restaurant & Delivery. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
