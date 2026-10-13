/**
 * Server-Side User Management Storage (File-based)
 *
 * Provides persistent storage for users (customers, staff, admins)
 * in data/users.json so changes persist across server restarts.
 */

import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

const INITIAL_USERS = [
  {
    id: "usr_admin",
    name: "John Holland",
    email: "admin@addiseats.com",
    phone: "+251 91 123 4567",
    role: "admin",
    status: "active",
    avatar: "/images/service-1.jpg",
    ordersCount: 0,
    totalSpent: 0,
    joinedDate: "2025-01-15",
    lastActive: "Just now",
  },
  {
    id: "usr_abebe",
    name: "Abebe Bikila",
    email: "demo@addiseats.com",
    phone: "+251 91 122 3344",
    role: "customer",
    status: "active",
    avatar: "/images/customer.png",
    ordersCount: 14,
    totalSpent: 602.0,
    joinedDate: "2025-02-10",
    lastActive: "5 mins ago",
  },
  {
    id: "usr_selam",
    name: "Selamawit Kebede",
    email: "selam@addiseats.com",
    phone: "+251 92 233 4455",
    role: "customer",
    status: "active",
    avatar: "",
    ordersCount: 8,
    totalSpent: 345.5,
    joinedDate: "2025-03-01",
    lastActive: "2 hours ago",
  },
  {
    id: "usr_dawit",
    name: "Dawit Mengistu",
    email: "dawit.m@example.com",
    phone: "+251 93 344 5566",
    role: "customer",
    status: "active",
    avatar: "",
    ordersCount: 5,
    totalSpent: 189.2,
    joinedDate: "2025-04-12",
    lastActive: "1 day ago",
  },
  {
    id: "usr_bethlehem",
    name: "Bethlehem Tadesse",
    email: "bethlehem@example.com",
    phone: "+251 95 566 7788",
    role: "customer",
    status: "active",
    avatar: "",
    ordersCount: 11,
    totalSpent: 489.0,
    joinedDate: "2025-05-20",
    lastActive: "3 days ago",
  },
  {
    id: "usr_yonas",
    name: "Yonas Alemu",
    email: "yonas.staff@addiseats.com",
    phone: "+251 96 677 8899",
    role: "staff",
    status: "active",
    avatar: "",
    ordersCount: 0,
    totalSpent: 0,
    joinedDate: "2025-06-01",
    lastActive: "10 mins ago",
  },
  {
    id: "usr_samuel",
    name: "Samuel Hailu",
    email: "samuel.h@example.com",
    phone: "+251 97 788 9900",
    role: "customer",
    status: "suspended",
    avatar: "",
    ordersCount: 2,
    totalSpent: 75.0,
    joinedDate: "2025-07-15",
    lastActive: "1 month ago",
  },
];

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readUsersFromFile() {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[usersStore] Could not read users file, using initial:", err.message);
  }
  // Initialize file with default users
  writeUsersToFile(INITIAL_USERS);
  return [...INITIAL_USERS];
}

export function writeUsersToFile(usersArray) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2), "utf-8");
  } catch (err) {
    console.error("[usersStore] Failed writing users file:", err.message);
  }
}

export function getAllUsers() {
  return readUsersFromFile();
}

export function getUserById(id) {
  const users = readUsersFromFile();
  return users.find((u) => u.id === id) || null;
}

export function addUser(userData) {
  const users = readUsersFromFile();
  const id = userData.id || `usr_${Date.now().toString(36)}`;
  const newUser = {
    id,
    name: userData.name || "New User",
    email: userData.email,
    phone: userData.phone || "+251 90 000 0000",
    role: userData.role || "customer",
    status: userData.status || "active",
    avatar: userData.avatar || "",
    ordersCount: 0,
    totalSpent: 0,
    joinedDate: new Date().toISOString().split("T")[0],
    lastActive: "Just now",
  };

  users.unshift(newUser);
  writeUsersToFile(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = readUsersFromFile();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    id: users[index].id, // Prevent overriding ID
  };

  writeUsersToFile(users);
  return users[index];
}

export function deleteUser(id) {
  const users = readUsersFromFile();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;

  writeUsersToFile(filtered);
  return true;
}
