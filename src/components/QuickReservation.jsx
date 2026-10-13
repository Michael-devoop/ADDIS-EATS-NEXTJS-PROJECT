"use client";

import { useState } from "react";

export default function QuickReservation() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }, 600);
  };

  return (
    <section className="overflow-hidden bg-[#fafafa] py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-[0_0_20px_rgba(0,0,0,0.05)] sm:p-12">
          {/* Reservation Form Header */}
          <div className="section-headding mb-8 text-center">
            <span className="sub-title uppercase">Book A Table</span>
            <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl lg:text-5xl">
              Quick Reservation
            </h2>
          </div>

          {submitted ? (
            <div className="rounded bg-primary/10 p-6 text-center text-primary">
              <p className="font-semibold">
                Thank you! Your table reservation request has been received.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  aria-label="Full Name"
                  placeholder="Name*"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  aria-label="Email Address"
                  placeholder="Email*"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  required
                  aria-label="Phone Number"
                  placeholder="Phone*"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="time"
                  required
                  aria-label="Reservation Time"
                  placeholder="Time* (e.g. 7:00 PM)"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="date"
                  required
                  aria-label="Reservation Date"
                  placeholder="Date* (DD/MM/YYYY)"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="guest"
                  required
                  aria-label="Number of Guests"
                  placeholder="Guest* (e.g. 2 People)"
                  className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="text-center sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button min-h-[44px] w-full sm:w-auto sm:px-12 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Booking..." : "Book Now"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
