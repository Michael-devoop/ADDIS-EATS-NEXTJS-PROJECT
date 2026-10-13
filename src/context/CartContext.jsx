"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";

const CartContext = createContext(null);

// Cart schema version for forward compatibility
const CART_SCHEMA_VERSION = 1;
const CART_STORAGE_KEY = "addis_eats_cart";

const emptySubscribe = () => () => {};

function getInitialCartItems() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version === CART_SCHEMA_VERSION && Array.isArray(parsed.items)) {
        return parsed.items;
      }
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch {
    // Inaccessible
  }
  return [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getInitialCartItems);
  const isFirstMountRef = useRef(true);

  // React 18/19 official hydration store - zero cascading re-renders
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Cross-tab storage synchronization
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        setItems(getInitialCartItems());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save to private localStorage whenever items change (skips initial mount)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    try {
      const dataToStore = {
        version: CART_SCHEMA_VERSION,
        items,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch {
      // Storage might be restricted or full
    }
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          image: product.image || "/images/product-1.jpg",
          desc: product.desc || "",
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, newQty) => {
    const qty = Math.max(1, Math.min(99, Number(newQty) || 1));
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const incrementQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(99, i.qty + 1) } : i))
    );
  }, []);

  const decrementQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? (subtotal >= 60 ? 0 : 4.0) : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        removeItem,
        updateQty,
        incrementQty,
        decrementQty,
        clearCart,
        totalCount,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
