/**
 * Dish Storage Module (Serverless & Read-Only Safe)
 * 
 * Provides hybrid persistent storage for dishes:
 * - Uses in-memory state as resilient primary/fallback store
 * - Persists to disk when filesystem is writable
 * - Automatically falls back to os.tmpdir() on Vercel serverless environments
 * - Never throws uncaught EROFS / filesystem errors
 */

import fs from "fs";
import path from "path";
import os from "os";
import { menuItems } from "@/data/menuData";

// Use /tmp on Vercel serverless environments to avoid EROFS read-only errors
const DISHES_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), "addis_eats_dishes.json")
  : path.join(process.cwd(), "data", "dishes.json");

// In-memory cache ensures zero downtime even on read-only serverless filesystems
let memoryDishes = [...menuItems];
let isInitialized = false;

// Safely ensure data directory exists without throwing
function ensureDataDirectory() {
  try {
    const dataDir = path.dirname(DISHES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return true;
  } catch (err) {
    // Read-only filesystem or permissions error; fallback to in-memory
    return false;
  }
}

/**
 * Read all dishes from file or in-memory fallback
 * @returns {Array}
 */
function readDishes() {
  if (isInitialized && memoryDishes.length > 0) {
    return memoryDishes;
  }

  try {
    if (fs.existsSync(DISHES_FILE)) {
      const data = fs.readFileSync(DISHES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryDishes = parsed;
        isInitialized = true;
        return memoryDishes;
      }
    }
  } catch (error) {
    console.warn("[dishStorage] Could not read dishes from disk, using default menu:", error.message);
  }

  // Seed default items in memory and try persisting if writable
  memoryDishes = [...menuItems];
  isInitialized = true;
  writeDishes(memoryDishes);
  return memoryDishes;
}

/**
 * Write all dishes to file and memory
 * @param {Array} dishes
 */
function writeDishes(dishes) {
  memoryDishes = [...dishes];

  try {
    if (ensureDataDirectory()) {
      fs.writeFileSync(DISHES_FILE, JSON.stringify(dishes, null, 2), "utf-8");
    }
  } catch (error) {
    console.warn("[dishStorage] Filesystem write skipped (read-only environment):", error.message);
  }
}

/**
 * Get all dishes
 * @returns {Array}
 */
export function getAllDishes() {
  return readDishes();
}

/**
 * Get dish by ID
 * @param {string} id
 * @returns {Object | null}
 */
export function getDishById(id) {
  const dishes = readDishes();
  return dishes.find((dish) => dish.id === id) || null;
}

/**
 * Add a new dish
 * @param {Object} dishData
 * @returns {Object} The added dish
 */
export function addDish(dishData) {
  const dishes = readDishes();
  const newDish = {
    id: dishData.id || dishData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: dishData.name,
    price: parseFloat(dishData.price),
    categories: Array.isArray(dishData.categories) ? dishData.categories : ["starters"],
    desc: dishData.desc || "Freshly crafted with authentic ingredients",
    image: dishData.image || "/images/menu-1.jpg",
  };

  dishes.push(newDish);
  writeDishes(dishes);
  return newDish;
}

/**
 * Update existing dish
 * @param {string} id
 * @param {Object} updates
 * @returns {Object | null} Updated dish or null if not found
 */
export function updateDish(id, updates) {
  const dishes = readDishes();
  const index = dishes.findIndex((dish) => dish.id === id);

  if (index === -1) return null;

  dishes[index] = {
    ...dishes[index],
    ...updates,
    id: dishes[index].id, // Preserve ID
  };

  writeDishes(dishes);
  return dishes[index];
}

/**
 * Delete dish by ID
 * @param {string} id
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteDish(id) {
  const dishes = readDishes();
  const filteredDishes = dishes.filter((dish) => dish.id !== id);

  if (filteredDishes.length === dishes.length) {
    return false; // Dish not found
  }

  writeDishes(filteredDishes);
  return true;
}

/**
 * Filter dishes by category
 * @param {string} category
 * @returns {Array}
 */
export function getDishesByCategory(category) {
  const dishes = readDishes();
  if (!category || category === "all") {
    return dishes;
  }
  const targetCategory = category.toLowerCase();
  return dishes.filter(
    (dish) =>
      Array.isArray(dish.categories) &&
      dish.categories.some((c) => c.toLowerCase() === targetCategory)
  );
}

/**
 * Search dishes by query
 * @param {string} query
 * @returns {Array}
 */
export function searchDishes(query) {
  if (!query) return readDishes();

  const dishes = readDishes();
  const lowerQuery = query.toLowerCase();

  return dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.desc?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Reset dishes to default menu items
 */
export function resetDishes() {
  writeDishes([...menuItems]);
}
