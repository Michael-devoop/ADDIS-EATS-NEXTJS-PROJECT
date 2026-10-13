"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useCart } from "@/context/CartContext";

const menu = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Contact", href: "/contact" },
];

const linkClass = (active) =>
  `block py-3 font-heading text-[15px] font-semibold uppercase tracking-wider transition-colors hover:text-primary lg:py-0 ${
    active ? "text-primary" : "text-[#4b5563]"
  }`;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Authenticated user session state via SWR (queries session endpoint reliably)
  const { data: sessionData, mutate: mutateSession } = useSWR(
    "/api/auth/session",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      dedupingInterval: 5000,
    }
  );
  const session = sessionData?.authenticated ? sessionData.session : null;
  const userInitial = (
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  const { items, removeItem, updateQty, totalCount: count, subtotal } = useCart();

  const closeAll = () => {
    setMenuOpen(false);
    setCartOpen(false);
    setUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await mutateSession({ authenticated: false, session: null }, false);
      closeAll();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const remove = (id) => removeItem(id);
  const setQty = (id, value) => updateQty(id, value);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Shared Cart Dropdown component
  const renderCartDropdownContent = () => (
    <>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#6b6f72]">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex gap-3">
                  <Link href="/shop-detail" onClick={closeAll} className="shrink-0">
                    <Image
                      src={item.image}
                      alt={`${item.name} cart item thumbnail`}
                      width={60}
                      height={60}
                      sizes="60px"
                      className="h-[60px] w-[60px] rounded object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      href="/shop-detail"
                      onClick={closeAll}
                      className="block text-sm font-semibold text-dark hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <span className="block text-sm font-semibold text-primary">
                      {Math.round(item.price * 125.5).toLocaleString()} ETB
                    </span>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#6b6f72]">
                      <span>Qty:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.qty}
                        aria-label={`Quantity for ${item.name}`}
                        onChange={(e) => setQty(item.id, e.target.value)}
                        className="w-12 rounded border border-gray-300 px-1 py-0.5 text-center text-xs text-dark"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => remove(item.id)}
                  className="text-xl leading-none text-[#6b6f72] hover:text-primary"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
            <span className="font-semibold text-dark">Subtotal:</span>
            <span className="font-semibold text-primary">{Math.round(Number(subtotal) * 125.5).toLocaleString()} ETB</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={closeAll}
              className="rounded bg-dark py-2 text-center text-xs font-semibold uppercase text-white transition hover:bg-primary"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              prefetch={false}
              onClick={closeAll}
              className="rounded bg-primary py-2 text-center text-xs font-semibold uppercase text-white transition hover:bg-dark"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </>
  );

  // Shared User Dropdown component
  const renderUserDropdownContent = () => (
    <>
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white shadow-sm">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-dark">{session.user.name}</p>
          <p className="truncate text-xs text-[#6b6f72]">{session.user.email}</p>
        </div>
      </div>

      <div className="py-2 space-y-1">
        {session.user?.role === "admin" && (
          <Link
            id="user-dropdown-admin"
            href="/admin/dashboard"
            onClick={closeAll}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-[#f9faf7]"
          >
            <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Admin Dashboard</span>
          </Link>
        )}
        <Link
          id="user-dropdown-order-history"
          href="/order-history"
          onClick={closeAll}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-dark transition hover:bg-[#f9faf7] hover:text-primary"
        >
          <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span>Order History</span>
        </Link>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          id="user-dropdown-signout"
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
        >
          <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full">
      {/* =========================================================================
          DESKTOP HEADER VIEW (lg and up)
          ========================================================================= */}
      <div className="container mx-auto px-4 hidden lg:flex h-16 sm:h-20 lg:h-[84px] items-center justify-between">
        {/* Desktop Brand Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/images/logoimage-cropped.png"
            alt="Addis Eats Restaurant & Delivery Logo"
            width={218}
            height={50}
            sizes="218px"
            loading="eager"
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
          />
        </Link>

        {/* Desktop Nav Links (Hidden on Admin) */}
        {!isAdmin && (
          <ul className="flex items-center gap-10">
            {menu.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={closeAll} className={linkClass(isActive(item.href))}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop Action Icons (Search, User, Cart) matching HTML template */}
        <div className="menu-icon">
          <ul className="flex items-center gap-6">
            {/* Desktop Search */}
            <li className="header-search">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="block cursor-pointer transition py-3"
              >
                <Image
                  src="/images/search.png"
                  alt="Search Icon"
                  width={28}
                  height={27}
                  sizes="28px"
                  style={{ width: "auto", height: "auto" }}
                  className="menu-icon-img object-contain"
                />
              </button>
            </li>

            {/* Desktop User Account Menu */}
            <li className="admin-user relative">
              {session ? (
                <>
                  <button
                    id="user-menu-btn"
                    type="button"
                    aria-label={`User Account Menu for ${session.user.name || "User"}`}
                    aria-expanded={userMenuOpen}
                    onClick={() => {
                      setUserMenuOpen((open) => !open);
                      setCartOpen(false);
                    }}
                    className="relative flex items-center justify-center cursor-pointer transition py-3"
                    title={`Signed in as ${session.user.name}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white shadow-sm ring-2 ring-primary/20 transition-all hover:ring-primary/50 hover:scale-105 active:scale-95 select-none">
                      {userInitial}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close user menu"
                        tabIndex={-1}
                        className="fixed inset-0 z-40 bg-transparent cursor-default"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div
                        id="user-dropdown-menu"
                        className="absolute right-0 top-full mt-2 w-64 max-w-[90vw] rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95"
                      >
                        {renderUserDropdownContent()}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  id="user-login-link"
                  href="/login"
                  onClick={closeAll}
                  className="block transition py-3 cursor-pointer"
                  title="Sign In"
                >
                  <Image
                    src="/images/user.png"
                    alt="User Icon"
                    width={27}
                    height={27}
                    sizes="27px"
                    style={{ width: "auto", height: "auto" }}
                    className="menu-icon-img object-contain"
                  />
                </Link>
              )}
            </li>

            {/* Desktop Cart */}
            <li className="cart relative">
              <button
                type="button"
                aria-label="Cart"
                onClick={() => {
                  setCartOpen((open) => !open);
                  setUserMenuOpen(false);
                }}
                className="cart-link relative block cursor-pointer transition py-3"
              >
                <Image
                  src="/images/cart.png"
                  alt="Cart Icon"
                  width={30}
                  height={27}
                  sizes="30px"
                  style={{ width: "auto", height: "auto" }}
                  className="menu-icon-img object-contain"
                />
                <span
                  suppressHydrationWarning
                  className="count absolute -top-1 -right-2.5 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-[#08070f] text-[11px] font-bold text-white leading-none"
                >
                  {count}
                </span>
              </button>

              {cartOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close cart menu"
                      tabIndex={-1}
                      className="fixed inset-0 z-40 bg-transparent cursor-default"
                      onClick={() => setCartOpen(false)}
                    />
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white p-4 shadow-xl border border-gray-100 rounded-xl z-50 animate-in fade-in zoom-in-95">
                    {renderCartDropdownContent()}
                  </div>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HEADER VIEW (< lg)
          ========================================================================= */}
      <div className="lg:hidden">
        {/* Mobile Top Header: Logo on Left, Hamburger on Right */}
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <Link href="/" onClick={closeAll} className="shrink-0 flex items-center">
            <Image
              src="/images/logoimage-cropped.png"
              alt="Addis Eats Restaurant & Delivery Logo"
              width={140}
              height={32}
              sizes="140px"
              loading="eager"
              style={{ width: "auto", height: "auto" }}
              className="object-contain"
            />
          </Link>

          {/* Hamburger Menu Toggle (3 horizontal gray bars) */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => {
              setMenuOpen(true);
              setCartOpen(false);
              setUserMenuOpen(false);
            }}
            className="flex flex-col justify-center items-end gap-[5px] p-1.5 focus:outline-none cursor-pointer"
          >
            <span className="block h-[2px] w-6 bg-[#6b6f72]" />
            <span className="block h-[2px] w-6 bg-[#6b6f72]" />
            <span className="block h-[2px] w-6 bg-[#6b6f72]" />
          </button>
        </div>

        {/* Mobile Floating Cart Dropdown (Pops up above bottom bar) */}
        {cartOpen && (
          <>
            <button
              type="button"
              aria-label="Close mobile cart"
              tabIndex={-1}
              className="fixed inset-0 z-40 bg-black/20 cursor-default"
              onClick={() => setCartOpen(false)}
            />
            <div className="fixed inset-x-3 bottom-[64px] z-50 bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                <span className="font-heading font-bold text-sm text-dark uppercase">Your Cart</span>
                <button
                  type="button"
                  aria-label="Close cart"
                  onClick={() => setCartOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xl text-[#6b6f72] hover:text-primary leading-none"
                >
                  ×
                </button>
              </div>
              {renderCartDropdownContent()}
            </div>
          </>
        )}

        {/* Mobile Floating User Dropdown (Pops up above bottom bar) */}
        {userMenuOpen && session && (
          <>
            <button
              type="button"
              aria-label="Close account menu"
              tabIndex={-1}
              className="fixed inset-0 z-40 bg-black/20 cursor-default"
              onClick={() => setUserMenuOpen(false)}
            />
            <div className="fixed inset-x-4 bottom-[64px] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-72 z-50 rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between pb-2 mb-2">
                <span className="font-heading font-bold text-xs text-[#8c9196] uppercase tracking-wider">Account</span>
                <button
                  type="button"
                  aria-label="Close account dialog"
                  onClick={() => setUserMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xl text-[#6b6f72] hover:text-primary leading-none"
                >
                  ×
                </button>
              </div>
              {renderUserDropdownContent()}
            </div>
          </>
        )}
      </div>

      {/* =========================================================================
          MOBILE FIXED BOTTOM FOOTER NAVIGATION BAR (< lg)
          ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(8,7,15,0.08)] lg:hidden"
      >
        <div className="container mx-auto px-6 py-3.5 menu-icon">
          <ul className="flex items-center justify-between w-full max-w-md mx-auto">
            {/* Left: Cart Icon with Round Count Badge ("0") */}
            <li className="cart relative">
              <button
                type="button"
                aria-label="Cart"
                onClick={() => {
                  setCartOpen((open) => !open);
                  setUserMenuOpen(false);
                }}
                className="cart-link flex items-center cursor-pointer transition py-1 hover:opacity-90 active:scale-95"
              >
                <Image
                  src="/images/cart.png"
                  alt="Cart Icon"
                  width={32}
                  height={32}
                  sizes="32px"
                  style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                  className="menu-icon-img object-contain"
                />
                <span
                  suppressHydrationWarning
                  className="count ml-2 inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#08070f] text-[11px] font-bold text-white leading-none"
                >
                  {count}
                </span>
              </button>
            </li>

            {/* Center: User Icon */}
            <li className="admin-user relative">
              {session ? (
                <button
                  id="mobile-user-menu-btn"
                  type="button"
                  aria-label={`User Account Menu for ${session.user.name || "User"}`}
                  aria-expanded={userMenuOpen}
                  onClick={() => {
                    setUserMenuOpen((open) => !open);
                    setCartOpen(false);
                  }}
                  className="relative flex items-center justify-center cursor-pointer transition py-1 hover:opacity-90 active:scale-95"
                  title={`Signed in as ${session.user.name}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-base font-bold text-white shadow-sm ring-2 ring-primary/20 select-none">
                    {userInitial}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeAll}
                  className="block transition py-1 cursor-pointer hover:opacity-90 active:scale-95"
                  title="Sign In"
                >
                  <Image
                    src="/images/user.png"
                    alt="User Icon"
                    width={32}
                    height={32}
                    sizes="32px"
                    style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                    className="menu-icon-img object-contain"
                  />
                </Link>
              )}
            </li>

            {/* Right: Search Icon */}
            <li className="header-search">
              <button
                type="button"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen(true);
                  setCartOpen(false);
                  setUserMenuOpen(false);
                }}
                className="block cursor-pointer transition py-1 hover:opacity-90 active:scale-95"
              >
                <Image
                  src="/images/search.png"
                  alt="Search Icon"
                  width={32}
                  height={32}
                  sizes="32px"
                  style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                  className="menu-icon-img object-contain"
                />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* =========================================================================
          SLIDE-OUT DRAWER MENU (Mobile)
          ========================================================================= */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close mobile navigation drawer"
          tabIndex={-1}
          className="fixed inset-0 z-[55] bg-black/50 lg:hidden cursor-default"
          onClick={closeAll}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-[60] w-72 overflow-y-auto bg-white p-6 transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Image
            src="/images/logoimage-cropped.png"
            alt="Addis Eats Mobile Navigation Logo"
            width={140}
            height={32}
            sizes="140px"
            loading="lazy"
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
          />
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeAll}
            className="text-3xl leading-none text-dark"
          >
            ×
          </button>
        </div>

        {!isAdmin && (
          <ul className="flex flex-col gap-2">
            {menu.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className={linkClass(isActive(item.href))}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {session ? (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white shadow-sm">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-dark">{session.user.name}</p>
                <p className="truncate text-xs text-[#6b6f72]">{session.user.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              {session.user?.role === "admin" && (
                <Link
                  id="mobile-drawer-admin"
                  href="/admin/dashboard"
                  onClick={closeAll}
                  className="flex items-center gap-2 py-2 text-sm font-semibold text-primary hover:text-dark transition"
                >
                  <span>🛡️ Admin Dashboard</span>
                </Link>
              )}
              <Link
                href="/order-history"
                onClick={closeAll}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-dark hover:text-primary transition"
              >
                <span>Order History</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-red-600 hover:text-red-700 transition cursor-pointer"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <Link
              href="/login"
              onClick={closeAll}
              className="flex items-center gap-2 py-2 font-heading text-sm font-semibold uppercase tracking-wider text-primary hover:text-dark transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================================
          FULLSCREEN SEARCH MODAL
          ========================================================================= */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value.trim();
              if (q) {
                setSearchOpen(false);
                router.push(`/menu?search=${encodeURIComponent(q)}`);
              }
            }}
            className="relative w-full max-w-xl"
          >
            <input
              name="search"
              type="text"
              placeholder="Search Menu Dishes..."
              aria-label="Search Menu Dishes"
              autoFocus
              className="w-full border-b-2 border-gray-300 bg-transparent py-3 pr-24 text-lg text-white placeholder-gray-400 outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-10 top-3 text-white hover:text-primary cursor-pointer"
            >
              <Image
                src="/images/search.png"
                alt="Submit search query icon"
                width={21}
                height={20}
                sizes="21px"
                style={{ width: "auto", height: "auto" }}
                className="brightness-0 invert"
              />
            </button>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="absolute right-0 top-1 text-3xl leading-none text-white hover:text-primary cursor-pointer"
            >
              ×
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
