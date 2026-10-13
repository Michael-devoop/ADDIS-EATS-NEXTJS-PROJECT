"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    removeItem,
    incrementQty,
    decrementQty,
    updateQty,
    clearCart,
    subtotal,
    shipping,
    total,
  } = useCart();

  const [country, setCountry] = useState("Ethiopia");
  const [city, setCity] = useState("Addis Ababa");
  const [zipCode, setZipCode] = useState("");
  const [shippingCalculated, setShippingCalculated] = useState(false);

  const handleCalculateShipping = (e) => {
    e.preventDefault();
    setShippingCalculated(true);
  };

  return (
    <>
      <PageBanner
        title="Shopping cart"
        description="Review your selected dishes, adjust item quantities, estimate delivery to your doorstep, and proceed to checkout."
        breadcrumbs={[{ label: "Shop", href: "/menu" }, { label: "Cart" }]}
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            /* Empty Cart View */
            <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-[#fbfbfb] p-10 text-center shadow-sm sm:p-14">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>

              <h2 className="font-heading text-2xl font-bold uppercase text-dark sm:text-3xl">
                Your Cart is Empty
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6b6f72]">
                Looks like you haven’t added any dishes yet. Discover our fresh, delicious
                Ethiopian delicacies and chef specials!
              </p>

              <div className="mt-8">
                <Link href="/menu" className="button">
                  Explore Menu
                </Link>
              </div>
            </div>
          ) : (
            /* Populated Cart View */
            <div className="space-y-12">
              {/* Cart Table Container */}
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#f9faf7] text-xs font-heading font-semibold uppercase tracking-wider text-dark">
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-center">Quantity</th>
                      <th className="px-6 py-4 text-right">Total</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-gray-50/60"
                      >
                        {/* Product Info */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={item.image}
                                alt={`${item.name} cart order item thumbnail`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h6 className="font-heading text-base font-semibold text-dark">
                                <Link
                                  href={`/menu/${item.id}`}
                                  className="transition hover:text-primary"
                                >
                                  {item.name}
                                </Link>
                              </h6>
                              {item.desc && (
                                <p className="mt-1 line-clamp-1 max-w-xs text-xs text-[#6b6f72]">
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="px-6 py-5 font-heading text-base font-bold text-dark">
                          {Math.round(item.price * 125.5).toLocaleString()} ETB
                        </td>

                        {/* Quantity Stepper with 44px touch targets */}
                        <td className="px-6 py-5">
                          <div className="mx-auto flex w-36 items-center justify-between rounded-md border border-gray-200 bg-white px-1">
                            <button
                              type="button"
                              onClick={() => decrementQty(item.id)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-base font-bold text-dark transition hover:text-primary"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={item.qty}
                              onChange={(e) => updateQty(item.id, e.target.value)}
                              aria-label={`Quantity of ${item.name}`}
                              className="w-12 text-center text-sm font-semibold text-dark outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => incrementQty(item.id)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-base font-bold text-dark transition hover:text-primary"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Line Total */}
                        <td className="px-6 py-5 text-right font-heading text-base font-bold text-primary">
                          {Math.round(item.price * item.qty * 125.5).toLocaleString()} ETB
                        </td>

                        {/* Remove Action with 44px touch target */}
                        <td className="px-6 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xl leading-none text-gray-400 transition hover:bg-red-50 hover:text-red-500 mx-auto"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons: Continue Shopping & Clear Cart */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:text-primary"
                >
                  <span aria-hidden="true">←</span> Continue Shopping
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded border border-gray-300 px-5 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-[#6b6f72] transition hover:border-red-500 hover:text-red-500"
                >
                  Clear Cart
                </button>
              </div>

              {/* Shipping Estimate & Cart Totals */}
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Shipping Estimator */}
                <div className="rounded-xl border border-gray-100 bg-[#fbfbfb] p-6 sm:p-8">
                  <h3 className="font-heading text-xl font-bold uppercase text-dark">
                    Estimate Shipping And Tax
                  </h3>
                  <p className="mt-1 text-xs text-[#6b6f72]">
                    Enter your destination to get a delivery shipping estimate. Free shipping on
                    orders over $60!
                  </p>

                  <form onSubmit={handleCalculateShipping} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                        Country
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                      >
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          City / Region
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Addis Ababa"
                          className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Zip / Postal Code
                        </label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="e.g. 1000"
                          className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="button !py-2.5 !text-xs">
                        Calculate Shipping
                      </button>
                    </div>

                    {shippingCalculated && (
                      <p className="rounded bg-green-50 p-2.5 text-xs text-primary font-medium">
                        ✓ Delivery to {city}, {country} is ready. Estimated delivery: 30–45 mins.
                      </p>
                    )}
                  </form>
                </div>

                {/* Cart Total Summary */}
                <div className="rounded-xl border border-gray-100 bg-[#fbfbfb] p-6 sm:p-8">
                  <h3 className="font-heading text-xl font-bold uppercase text-dark">
                    Cart Total
                  </h3>

                  <div className="mt-6 divide-y divide-gray-200/70 text-sm">
                    <div className="flex items-center justify-between py-3.5">
                      <span className="text-[#6b6f72]">Item(s) Subtotal</span>
                      <span className="font-heading font-bold text-dark">
                        {Math.round(subtotal * 125.5).toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <span className="text-[#6b6f72]">Shipping Cost</span>
                      <span className="font-heading font-bold text-dark">
                        {shipping === 0 ? (
                          <span className="text-primary font-semibold">FREE</span>
                        ) : (
                          `${Math.round(shipping * 125.5).toLocaleString()} ETB`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-4 text-base">
                      <span className="font-heading font-bold uppercase text-dark">Order Total</span>
                      <span className="font-heading text-2xl font-extrabold text-primary">
                        {Math.round(total * 125.5).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/checkout"
                      prefetch={false}
                      className="button block w-full text-center shadow-lg"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
