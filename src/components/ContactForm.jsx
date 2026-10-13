"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      // Simulate form submission delay or API post
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      setErrorMessage("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-8 shadow-[0_0_20px_rgba(0,0,0,0.06)] sm:p-10">
      <div className="section-headding mb-6">
        <span className="sub-title uppercase">Send A Message</span>
        <h2 className="font-heading text-2xl font-bold uppercase text-dark sm:text-3xl">
          Get In Touch
        </h2>
      </div>

      {submitted ? (
        <div className="rounded border border-primary/20 bg-primary/10 p-6 text-primary animate-in fade-in duration-300">
          <h3 className="font-heading text-lg font-bold">Message Received!</h3>
          <p className="mt-2 text-sm text-[#4b5563]">
            Thank you for reaching out to Addis Eats. Our team will review your message and respond shortly.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="button mt-4 !py-2 !text-xs"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded bg-red-50 p-3 text-xs text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold uppercase text-dark">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Abebe Bikila"
                className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold uppercase text-dark">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="abebe@example.com"
                className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-phone" className="mb-1 block text-xs font-semibold uppercase text-dark">
                Phone Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251 911 00 22 33"
                className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold uppercase text-dark">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Table inquiry / Private catering"
                className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold uppercase text-dark">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us what you need or how we can assist you..."
              className="w-full bg-[#f5f5f5] px-4 py-3 text-sm text-dark outline-none transition focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="button w-full sm:w-auto sm:!px-10 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
