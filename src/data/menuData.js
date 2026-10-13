import { cache } from "react";

export const menuTabs = [
  { id: "all", label: "All items" },
  { id: "starters", label: "Starters" },
  { id: "maindishes", label: "Main Dishes" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

export const menuItems = [
  {
    id: "plain-sandwich",
    name: "Plain Sandwich",
    price: 66.7,
    image: "/images/menu-1.jpg",
    desc: "Freshly toasted artisanal bread layered with crisp garden greens, sliced tomatoes, savory spiced fillings, and signature herb dressing.",
    categories: ["starters"],
  },
  {
    id: "mixed-drink",
    name: "Mixed Drink",
    price: 65.77,
    image: "/images/menu-2.jpg",
    desc: "Refreshing signature tropical cooler crafted with freshly pressed Ethiopian mango, avocado, and ripe papaya juice blend.",
    categories: ["maindishes", "drinks"],
  },
  {
    id: "special-burger",
    name: "Special Burger",
    price: 75.88,
    image: "/images/menu-3.jpg",
    desc: "Juicy flame-grilled prime beef patty topped with melted cheddar, caramelized onions, crisp lettuce, and Addis house special sauce.",
    categories: ["starters", "drinks"],
  },
  {
    id: "adana-kabab",
    name: "Adana Kabab",
    price: 26.2,
    image: "/images/menu-4.jpg",
    desc: "Tender skewered minced lamb seasoned with aromatic Ethiopian herbs, garlic, and berbere chili, char-grilled over open coals.",
    categories: ["desserts"],
  },
  {
    id: "fast-platter",
    name: "Fast Platter",
    price: 46.12,
    image: "/images/menu-5.jpg",
    desc: "A vibrant sampler platter featuring golden lentil sambusas, seasoned potato wedges, fresh salad, and spicy dipping sauce.",
    categories: ["starters"],
  },
  {
    id: "cheese-pizza",
    name: "Cheese Pizza",
    price: 57.78,
    image: "/images/menu-6.jpg",
    desc: "Stone-baked thin crust pizza loaded with rich tomato marinara, melted whole-milk mozzarella, and fragrant fresh basil.",
    categories: ["maindishes"],
  },
  {
    id: "variety-drink",
    name: "Variety Drink",
    price: 36.69,
    image: "/images/menu-7.jpg",
    desc: "Chilled multi-layered fruit mocktail layered with freshly squeezed passionfruit, guava, and a zesty splash of lime sparkle.",
    categories: ["drinks"],
  },
  {
    id: "salad-fries",
    name: "Salad Fries",
    price: 77.32,
    image: "/images/menu-8.jpg",
    desc: "Hand-cut crispy golden fries served alongside a crisp Mediterranean-style garden salad dressed in lemon herb vinaigrette.",
    categories: ["desserts"],
  },
];

// Async data fetcher for generateStaticParams and server components
// Wrapped with React.cache() for per-request deduplication
export const getDishes = cache(async () => {
  return menuItems;
});

export const getDish = cache(async (id) => {
  return menuItems.find((d) => d.id === id) || null;
});

export const getCategories = cache(async () => {
  return menuTabs;
});

export const getRelatedDishes = cache(async (currentId) => {
  return menuItems.filter((d) => d.id !== currentId).slice(0, 4);
});
