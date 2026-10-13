"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { placeOrder, cancelOrder } from "@/actions/orderActions";
import {
  saveOrderToLocalStorage,
  updateStoredOrderStatus,
} from "@/lib/orderStorage";

const initialActionState = {
  success: null,
  order: null,
  error: "",
  fieldErrors: {},
};

export default function CheckoutForm({ sessionInfo, livePricing }) {
  const { items, subtotal, clearCart } = useCart();

  // placeOrder Server Action driven by React 19 `useActionState`
  const [state, formAction, isPending] = useActionState(
    placeOrder,
    initialActionState
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: sessionInfo?.userEmail || "",
    phone: "",
    country: "Ethiopia",
    address: "",
    zipCode: "",
    city: "Addis Ababa",
    orderNotes: "",
    createAccount: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [clearedFields, setClearedFields] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(null);
  const hasClearedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelOrder = async (orderId) => {
    setCancelling(true);
    setCancelStatus(null);
    const res = await cancelOrder(orderId);
    setCancelStatus(res);
    if (res?.success) {
      updateStoredOrderStatus(orderId, "Cancelled");
    }
    setCancelling(false);
  };

  // Reset locally cleared fields & submission lock when new server action state arrives
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setClearedFields({});
    isSubmittingRef.current = false;
    if (isSubmitting) setIsSubmitting(false);
  }

  // Clear cart and persist order to localStorage once upon successful order creation from server action
  useEffect(() => {
    if (state?.success && state?.order && !hasClearedRef.current) {
      hasClearedRef.current = true;
      clearCart();
      saveOrderToLocalStorage(state.order);
    }
  }, [state?.success, state?.order, clearCart]);

  // Live Server Pricing Calculations
  const taxAmount = subtotal * (livePricing?.taxRate || 0.08);
  const isFreeDelivery = subtotal >= (livePricing?.freeDeliveryThreshold || 60);
  const deliveryFee =
    subtotal > 0
      ? isFreeDelivery
        ? 0
        : livePricing?.baseDeliveryFee || 4.0
      : 0;
  const grandTotal = subtotal + taxAmount + deliveryFee;
  const etbEquivalent = (
    grandTotal * (livePricing?.etbExchangeRate || 125.5)
  ).toFixed(2);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setClearedFields((prev) => ({
      ...prev,
      [`customer.${name}`]: true,
      [name]: true,
    }));
  };

  const getFieldError = (key) => {
    if (clearedFields[key]) return null;
    return state?.fieldErrors?.[key] || null;
  };

  const orderPlaced = state?.success ? state.order : null;

  if (orderPlaced) {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-[#f9faf7] p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-primary">
              Order Confirmed via Server Action
            </span>
            <h2 className="font-heading mt-2 text-3xl font-bold uppercase text-dark sm:text-4xl">
              Thank You For Your Order!
            </h2>
            <p className="mt-3 text-sm text-[#6b6f72]">
              Order{" "}
              <strong className="text-dark font-mono">
                {orderPlaced.orderId}
              </strong>{" "}
              has been placed and verified on the server. A confirmation
              notification has been sent to{" "}
              <strong className="text-dark">
                {orderPlaced.customer.email || "your email"}
              </strong>
              .
            </p>

            {/* Order Summary Receipt */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left text-sm">
              <div className="flex flex-wrap justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <span className="block text-xs text-[#8c9196] uppercase">
                    Delivery To
                  </span>
                  <strong className="text-dark">
                    {orderPlaced.customer.firstName}{" "}
                    {orderPlaced.customer.lastName}
                  </strong>
                  <div className="text-xs text-[#6b6f72]">
                    {orderPlaced.customer.address}, {orderPlaced.customer.city}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-[#8c9196] uppercase">
                    Payment
                  </span>
                  <strong className="capitalize text-dark">
                    {orderPlaced.paymentMethod?.replace?.("_", " ") ||
                      orderPlaced.paymentMethod}
                  </strong>
                  <div className="text-xs text-primary font-semibold">
                    $
                    {(
                      orderPlaced.pricing?.total ??
                      orderPlaced.grandTotal ??
                      0
                    ).toFixed(2)}{" "}
                    (
                    {orderPlaced.pricing?.etbEquivalent ??
                      orderPlaced.etbEquivalent}{" "}
                    ETB)
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {orderPlaced.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs text-[#6b6f72]"
                  >
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-semibold text-dark">
                      ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {cancelStatus?.error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                ⚠️ {cancelStatus.error}
              </div>
            )}
            {cancelStatus?.success && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 font-semibold">
                ✓ {cancelStatus.message}
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={`/order-status?orderId=${orderPlaced.orderId}`}
                className="button inline-flex items-center gap-2 shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Track Live Status (Auto-refresh)
              </Link>
              <Link
                href="/order-history"
                className="rounded border-2 border-primary px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-white"
              >
                Order History
              </Link>
              {cancelStatus?.order?.status !== "Cancelled" && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => handleCancelOrder(orderPlaced.orderId)}
                  className="rounded border border-red-300 px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? "Verifying & Cancelling..." : "Cancel Order"}
                </button>
              )}
              <Link
                href="/menu"
                className="rounded border-2 border-dark px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-dark transition hover:bg-dark hover:text-white"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-[#fbfbfb] p-10 text-center shadow-sm">
            <h3 className="font-heading text-2xl font-bold uppercase text-dark">
              Your Cart is Empty
            </h3>
            <p className="mt-2 text-sm text-[#6b6f72]">
              Please add items to your cart before proceeding to checkout.
            </p>
            <div className="mt-6">
              <Link href="/menu" className="button">
                Browse Menu
              </Link>
            </div>
          </div>
        ) : (
          /* Form handled with onSubmit and double-click lock to ensure rapid double-tap creates only one order */
          <form
            action={formAction}
            onSubmit={(e) => {
              if (isSubmittingRef.current || isPending) {
                e.preventDefault();
                return false;
              }
              isSubmittingRef.current = true;
              setIsSubmitting(true);
            }}
          >
            {/* Hidden inputs to pass client-state items and payment method into FormData */}
            <input
              type="hidden"
              name="cartItems"
              value={JSON.stringify(
                items.map((item) => ({
                  id: String(item.id),
                  name: item.name,
                  price: Number(item.price),
                  qty: Number(item.qty),
                  image: item.image || "",
                  desc: item.desc || "",
                }))
              )}
            />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />

            {state?.error && !state?.success && (
              <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <strong className="font-semibold block text-red-900">
                    Order Validation Notice
                  </strong>
                  <span>{state.error}</span>
                </div>
              </div>
            )}

            <div className="grid gap-12 lg:grid-cols-12">
              {/* Left Column: Billing Details */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-gray-100 bg-[#fbfbfb] p-6 sm:p-8">
                  <h4 className="font-heading mb-6 text-xl font-bold uppercase text-dark">
                    Billing Details
                  </h4>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First Name"
                          className={`w-full rounded border ${
                            getFieldError("customer.firstName")
                              ? "border-red-500 bg-red-50/20"
                              : "border-gray-200"
                          } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                        />
                        {getFieldError("customer.firstName") && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {getFieldError("customer.firstName")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last Name"
                          className={`w-full rounded border ${
                            getFieldError("customer.lastName")
                              ? "border-red-500 bg-red-50/20"
                              : "border-gray-200"
                          } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                        />
                        {getFieldError("customer.lastName") && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {getFieldError("customer.lastName")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className={`w-full rounded border ${
                            getFieldError("customer.email")
                              ? "border-red-500 bg-red-50/20"
                              : "border-gray-200"
                          } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                        />
                        {getFieldError("customer.email") && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {getFieldError("customer.email")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. +251 91 123 4567"
                          className={`w-full rounded border ${
                            getFieldError("customer.phone")
                              ? "border-red-500 bg-red-50/20"
                              : "border-gray-200"
                          } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                        />
                        {getFieldError("customer.phone") && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {getFieldError("customer.phone")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                      >
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House number and street name, Subcity"
                        className={`w-full rounded border ${
                          getFieldError("customer.address")
                            ? "border-red-500 bg-red-50/20"
                            : "border-gray-200"
                        } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                      />
                      {getFieldError("customer.address") && (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          {getFieldError("customer.address")}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Postcode / Zip
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="e.g. 1000"
                          className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                          Town / City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Town / City"
                          className={`w-full rounded border ${
                            getFieldError("customer.city")
                              ? "border-red-500 bg-red-50/20"
                              : "border-gray-200"
                          } bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary`}
                        />
                        {getFieldError("customer.city") && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {getFieldError("customer.city")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-dark cursor-pointer">
                        <input
                          type="checkbox"
                          name="createAccount"
                          checked={formData.createAccount}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>
                          Create an account for faster checkout next time?
                        </span>
                      </label>
                    </div>

                    <div className="pt-4">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="orderNotes"
                        rows={3}
                        value={formData.orderNotes}
                        onChange={handleChange}
                        placeholder="Special instructions for delivery or spice preferences (e.g. extra injera, less spicy, contactless drop-off)..."
                        className="w-full rounded border border-gray-200 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Your Order & Payment Method */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-gray-100 bg-[#fbfbfb] p-6 sm:p-8 space-y-6">
                  <h4 className="font-heading text-xl font-bold uppercase text-dark">
                    Your Order
                  </h4>

                  {getFieldError("items") && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                      ⚠️ {getFieldError("items")}
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="divide-y divide-gray-200/70 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={item.image}
                            alt={`${item.name} checkout item thumbnail`}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-heading text-sm font-semibold text-dark truncate">
                            {item.name}
                          </h6>
                          <div className="flex items-center justify-between text-xs text-[#6b6f72]">
                            <span>Qty: {item.qty}</span>
                            <span className="font-semibold text-dark">
                              {Math.round(item.price * item.qty * (livePricing?.etbExchangeRate || 125.5)).toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Pricing Breakdown */}
                  <div className="border-t border-gray-200/70 pt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between text-[#6b6f72]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-dark">
                        {Math.round(subtotal * (livePricing?.etbExchangeRate || 125.5)).toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex justify-between text-[#6b6f72]">
                      <span>
                        Meal Tax & VAT (
                        {(livePricing?.taxRate * 100).toFixed(0)}%)
                      </span>
                      <span className="font-semibold text-dark">
                        {Math.round(taxAmount * (livePricing?.etbExchangeRate || 125.5)).toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex justify-between text-[#6b6f72]">
                      <span>
                        Delivery Fee ({livePricing?.surgeLabel})
                      </span>
                      <span className="font-semibold text-dark">
                        {deliveryFee === 0 ? (
                          <span className="text-primary font-bold">FREE</span>
                        ) : (
                          `${Math.round(deliveryFee * (livePricing?.etbExchangeRate || 125.5)).toLocaleString()} ETB`
                        )}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-gray-200 pt-4 text-base font-bold text-dark">
                      <span className="font-heading uppercase">Total</span>
                      <div className="text-right">
                        <span className="font-heading text-2xl font-extrabold text-primary">
                          {Math.round(grandTotal * (livePricing?.etbExchangeRate || 125.5)).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="border-t border-gray-200/70 pt-6">
                    <h5 className="font-heading mb-3 text-sm font-bold uppercase tracking-wider text-dark">
                      Payment Method
                    </h5>

                    {getFieldError("paymentMethod") && (
                      <p className="mb-2 text-xs text-red-500 font-medium">
                        {getFieldError("paymentMethod")}
                      </p>
                    )}

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-dark cursor-pointer transition hover:border-primary">
                        <input
                          type="radio"
                          name="paymentSelection"
                          value="telebirr"
                          checked={paymentMethod === "telebirr"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Telebirr / Mobile Money</span>
                      </label>

                      <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-dark cursor-pointer transition hover:border-primary">
                        <input
                          type="radio"
                          name="paymentSelection"
                          value="bank_transfer"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span>CBE / Direct Bank Transfer</span>
                      </label>

                      <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-dark cursor-pointer transition hover:border-primary">
                        <input
                          type="radio"
                          name="paymentSelection"
                          value="cash_delivery"
                          checked={paymentMethod === "cash_delivery"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Cash On Delivery</span>
                      </label>
                    </div>

                    {/* Secure Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8c9196]">
                      <Image
                        src="/images/secure.png"
                        alt="Guaranteed 256-bit SSL encrypted safe checkout badge"
                        width={133}
                        height={46}
                        sizes="133px"
                        className="h-5 w-auto"
                        style={{ width: "auto", height: "auto" }}
                      />
                      <span>Guaranteed Safe & Secure Checkout</span>
                    </div>

                    {/* Submit Button submitting directly to Server Action - disabled while pending with double-tap protection */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isPending || isSubmitting}
                        className="button min-h-[48px] flex w-full items-center justify-center gap-3 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {isPending || isSubmitting ? (
                          <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Placing Order...</span>
                          </>
                        ) : (
                          <>
                            <Image
                              src="/images/place-order-1.svg"
                              alt="Place order icon"
                              width={20}
                              height={20}
                              sizes="20px"
                              className="brightness-0 invert"
                              style={{ width: "auto", height: "auto" }}
                            />
                            <span>Place Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
