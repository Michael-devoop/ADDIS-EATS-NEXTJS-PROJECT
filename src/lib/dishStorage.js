/**
 * Dish Storage Module (File-based)
 * 
 * Provides persistent storage for dishes using a JSON file.
 * Replaces module-level mutable state to prevent data corruption.
 */

import fs from "fs";
import path from "path";
import { menuItems } from "@/data/menuData";

const DISHES_FILE = path.join(process.cwd(), "data", "dishes.json");

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(DISHES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Read all dishes from file
 * @returns {Array}
 */
function readDishes() {
  ensureDataDirectory();

  if (!fs.existsSync(DISHES_FILE)) {
    // Initialize with default menu items
    writeDishes(menuItems);
    return [...menuItems];
  }

  try {
    const data = fs.readFileSync(DISHES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading dishes file:", error);
    return [...menuItems];
  }
}

/**
 * Write all dishes to file
 * @param {Array} dishes
 */
function writeDishes(dishes) {
  ensureDataDirectory();

  try {
    fs.writeFileSync(DISHES_FILE, JSON.stringify(dishes, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing dishes file:", error);
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
      dish.desc.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Reset dishes to default menu items
 */
export function resetDishes() {
  writeDishes([...menuItems]);
}
