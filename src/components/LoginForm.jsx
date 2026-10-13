"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function LoginForm({ initialSession = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Live session state initialized from server getSession()
  const [session, setSession] = useState(initialSession);

  // Quick 1-click test fill
  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setAlert({
      type: "success",
      message: `Demo credentials filled (${demoEmail}). Click "Login" to authenticate.`,
    });
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!email || !password) {
      setAlert({ type: "error", message: "Email and password are both required." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      setSession(data.session);
      setAlert({
        type: "success",
        message: `Welcome back, ${data.session.user.name}! Redirecting...`,
      });

      // Target route resolution:
      // 1. Explicit ?redirect= param from URL (e.g. /checkout)
      // 2. Window location query string fallback
      // 3. If cart has items, user intended to checkout -> /checkout
      // 4. Default -> /menu
      const redirectParam =
        searchParams.get("redirect") ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null);

      let targetDestination;
      if (redirectParam) {
        if (redirectParam.startsWith("/admin") && data.session?.user?.role !== "admin") {
          targetDestination = "/order-history";
        } else {
          targetDestination = redirectParam;
        }
      } else if (data.session?.user?.role === "admin") {
        targetDestination = "/admin/dashboard";
      } else if (items && items.length > 0) {
        targetDestination = "/checkout";
      } else {
        targetDestination = "/menu";
      }

      // Hard navigation ensures browser delivers the newly set session_id cookie
      // directly on the top-level HTTP request, bypassing stale Next.js router cache
      setTimeout(() => {
        window.location.href = targetDestination;
      }, 400);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <section className="customer-form overflow-hidden py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Login Form */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="customer">
                {/* Heading matching template */}
                <div className="section-headding mb-8">
                  <span className="sub-title uppercase text-primary font-bold text-xs tracking-wider">
                    Delicious
                  </span>
                  <h2 className="font-heading text-3xl font-bold uppercase text-dark sm:text-4xl mt-1">
                    Customer Login
                  </h2>
                </div>

                {/* Active Session Notice & Switch Options */}
                {session?.isAuthenticated && (
                  <div className="mb-6 rounded-xl border border-primary/30 bg-[#fbfdfa] p-4 text-sm shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-semibold text-dark">
                          Signed in as:{" "}
                        </span>
                        <span className="text-primary font-bold">{session.user.name}</span>
                        <span className="text-[#6b6f72] text-xs ml-1">({session.user.email})</span>
                        <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
                          {session.user.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.user.role === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white hover:opacity-90 transition"
                          >
                            🛡️ Admin Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            setSession(null);
                            setAlert({
                              type: "info",
                              message: "Signed out. You can now log into a different account.",
                            });
                          }}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#6b6f72]">
                      To switch accounts (e.g. to Administrator), enter credentials or pick a demo account below:
                    </p>
                  </div>
                )}

                {/* Feedback Alert Banner */}
                {alert && (
                  <div
                    className={`mb-6 rounded-lg p-4 text-sm font-medium transition-all ${
                      alert.type === "error"
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : alert.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                    role="alert"
                  >
                    {alert.message}
                  </div>
                )}

                {/* Login Form */}
                <form id="customer-login-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email*"
                      required
                      autoComplete="email"
                      className="w-full rounded border border-gray-200 bg-[#f9faf7] px-4 py-3.5 text-sm text-dark placeholder-gray-400 outline-none transition focus:border-primary focus:bg-white"
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="sr-only">
                      Your Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your Password*"
                      required
                      autoComplete="current-password"
                      className="w-full rounded border border-gray-200 bg-[#f9faf7] px-4 py-3.5 pr-12 text-sm text-dark placeholder-gray-400 outline-none transition focus:border-primary focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-dark"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Actions: Remember Me & Submit */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <label className="flex items-center gap-2 text-sm text-[#6b6f72] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                      />
                      <span>Remember Me</span>
                    </label>

                    <button
                      type="submit"
                      id="submit-login-btn"
                      disabled={loading}
                      className="button min-w-[140px] !py-3 !text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>

                {/* Helper Links matching template */}
                <div className="mt-6 space-y-1 text-sm text-[#6b6f72]">
                  <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/menu" className="font-semibold text-primary hover:underline">
                      Continue as Guest
                    </Link>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => handleFillDemo("demo@addiseats.com", "password123")}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Forgot your password? Use demo credentials.
                    </button>
                  </p>
                </div>

                {/* Quick 1-Click Demo Credentials */}
                <div className="mt-8 rounded-lg border border-dashed border-primary/40 bg-[#fbfdfa] p-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Quick Demo Sign-In Accounts
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemo("demo@addiseats.com", "password123")}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-dark shadow-sm transition hover:border-primary hover:text-primary cursor-pointer"
                    >
                      👤 Customer: demo@addiseats.com
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo("admin@addiseats.com", "admin123")}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-dark shadow-sm transition hover:border-primary hover:text-primary cursor-pointer"
                    >
                      🛡️ Admin: admin@addiseats.com
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Customer Image matching template */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center">
              <div className="relative overflow-hidden">
                <Image
                  src="/images/customer.png"
                  alt="Delighted customer enjoying authentic dining experience with Addis Eats"
                  width={560}
                  height={480}
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="w-full max-w-lg object-contain transition-transform duration-500 hover:scale-105"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
