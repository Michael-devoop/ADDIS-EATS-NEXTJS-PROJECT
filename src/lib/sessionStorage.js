/**
 * Server-Side Session Storage (File-based)
 * 
 * This module provides persistent session storage using a JSON file.
 * For production, replace with database storage (PostgreSQL, Redis, etc.)
 * 
 * Features:
 * - File-based persistence (survives server restarts)
 * - Automatic cleanup of expired sessions
 * - Thread-safe read/write operations
 */

import fs from "fs";
import path from "path";

const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json");
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(SESSIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Read all sessions from file
 * @returns {Map<string, Object>}
 */
function readSessions() {
  ensureDataDirectory();

  if (!fs.existsSync(SESSIONS_FILE)) {
    return new Map();
  }

  try {
    const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error("Error reading sessions file:", error);
    return new Map();
  }
}

/**
 * Write all sessions to file
 * @param {Map<string, Object>} sessions
 */
function writeSessions(sessions) {
  ensureDataDirectory();

  try {
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing sessions file:", error);
  }
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const sessions = readSessions();
  const now = Date.now();
  let cleaned = false;

  for (const [sessionId, sessionData] of sessions.entries()) {
    if (sessionData.expiresAt && now > sessionData.expiresAt) {
      sessions.delete(sessionId);
      cleaned = true;
    }
  }

  if (cleaned) {
    writeSessions(sessions);
  }
}

/**
 * Get session by ID
 * @param {string} sessionId
 * @returns {Object | null}
 */
export function getStoredSession(sessionId) {
  if (!sessionId) return null;

  const sessions = readSessions();
  const sessionData = sessions.get(sessionId);

  if (!sessionData) return null;

  // Check expiration
  if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
    deleteStoredSession(sessionId);
    return null;
  }

  return sessionData;
}

/**
 * Save session to storage
 * @param {string} sessionId
 * @param {Object} sessionData
 */
export function saveStoredSession(sessionId, sessionData) {
  const sessions = readSessions();
  sessions.set(sessionId, {
    ...sessionData,
    expiresAt: sessionData.expiresAt || (Date.now() + SESSION_DURATION_MS),
  });
  writeSessions(sessions);
}

/**
 * Delete session from storage
 * @param {string} sessionId
 */
export function deleteStoredSession(sessionId) {
  const sessions = readSessions();
  sessions.delete(sessionId);
  writeSessions(sessions);
}

/**
 * Get all active sessions
 * @returns {Map<string, Object>}
 */
export function getAllSessions() {
  cleanupExpiredSessions();
  return readSessions();
}

/**
 * Initialize with demo sessions if file doesn't exist
 */
export function initializeDemoSessions() {
  if (fs.existsSync(SESSIONS_FILE)) {
    return; // Already initialized
  }

  const demoSessions = new Map([
    [
      "demo-session-1",
      {
        userId: "usr_demo_1",
        email: "demo@addiseats.com",
        name: "Abebe Bikila",
        role: "customer",
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      },
    ],
    [
      "demo-session-2",
      {
        userId: "usr_demo_2",
        email: "selam@addiseats.com",
        name: "Selamawit Kebede",
        role: "customer",
        createdAt: Date.now() - 7200000,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      },
    ],
    [
      "demo-session-admin",
      {
        userId: "usr_admin_1",
        email: "admin@addiseats.com",
        name: "Admin User",
        role: "admin",
        createdAt: Date.now() - 10000,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      },
    ],
  ]);

  writeSessions(demoSessions);
}

// Initialize demo sessions on module load
initializeDemoSessions();

// Schedule periodic cleanup (every hour)
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}
