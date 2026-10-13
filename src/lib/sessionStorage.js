/**
 * Server-Side Session Storage (Serverless & Read-Only Safe)
 * 
 * Provides hybrid session storage using in-memory Map and optional disk persistence.
 * Resilient against read-only serverless filesystems (e.g. Vercel / AWS Lambda).
 */

import fs from "fs";
import path from "path";
import os from "os";

const SESSIONS_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), "addis_eats_sessions.json")
  : path.join(process.cwd(), "data", "sessions.json");

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Default initial demo sessions in-memory
const memorySessions = new Map([
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

let isInitialized = false;

// Ensure data directory exists without throwing
function ensureDataDirectory() {
  try {
    const dataDir = path.dirname(SESSIONS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Read all sessions from file or in-memory map
 * @returns {Map<string, Object>}
 */
function readSessions() {
  if (isInitialized) {
    return memorySessions;
  }

  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      for (const [key, value] of Object.entries(parsed)) {
        memorySessions.set(key, value);
      }
    }
  } catch (error) {
    console.warn("[sessionStorage] Could not read sessions from file:", error.message);
  }

  isInitialized = true;
  return memorySessions;
}

/**
 * Write all sessions to file and memory
 * @param {Map<string, Object>} sessions
 */
function writeSessions(sessions) {
  try {
    if (ensureDataDirectory()) {
      const obj = Object.fromEntries(sessions);
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), "utf-8");
    }
  } catch (error) {
    console.warn("[sessionStorage] File write skipped (read-only environment):", error.message);
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
  readSessions();
  writeSessions(memorySessions);
}

// Safely attempt initialization on module load without throwing
try {
  initializeDemoSessions();
} catch (e) {
  // Silent fallback to in-memory
}

// Periodic cleanup in persistent runtimes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}
