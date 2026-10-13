"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ item, className = "button" }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={added ? `${item?.name || "Item"} added to cart` : `Add ${item?.name || "Item"} to cart`}
      className={`min-h-[44px] inline-flex items-center justify-center ${className} transition-all duration-200 ${
        added ? "!bg-dark !text-white" : ""
      }`}
    >
      {added ? "Added to Cart! ✓" : "Add To Cart"}
    </button>
  );
}
