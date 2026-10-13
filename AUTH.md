# Addis Eats — Authentication & Authorization Architecture (`AUTH.md`)

This document specifies the defense-in-depth security architecture for Addis Eats Next.js, detailing every private route and action, their protective layers, what each layer cryptographically or logically proves, and the exact lines of code mitigating the top three web application attacks.

---

## 1. Private Routes & Protected Actions Matrix

| Route / Action | Type | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/admin/dashboard` | Route (Page) | Administrator | Operations command center, kitchen display, catalog & analytics |
| `/checkout` | Route (Page) | Authenticated | Multi-step order placement & payment settlement |
| `/order-history` | Route (Page) | Authenticated | Customer's personal order history |
| `/order-status/[orderId]` | Route (Page) | Owner / Admin | Live order tracking with real-time SSE progress updates |
| `POST /api/dishes` | API Action | Administrator | Add new dish item to persistent catalog |
| `PATCH /api/dishes/[id]` | API Action | Administrator | Update dish pricing, ingredients, or stock status |
| `DELETE /api/dishes/[id]` | API Action | Administrator | Remove dish from restaurant menu |
| `POST /api/orders` | API Action | Authenticated | Validate and place an order (deducts stock, assigns orderId) |
| `GET /api/orders` | API Action | Role-scoped | Returns customer's own orders, or all orders if Administrator |
| `GET /api/orders/[orderId]` | API Action | Owner / Admin | Retrieve individual order details (IDOR-protected) |
| `GET /api/orders/[orderId]/stream` | API Action | Owner / Admin | Server-Sent Events (SSE) live order tracking feed |
| `PATCH /api/orders/[orderId]` | API Action | Administrator | Update kitchen status (`pending` -> `preparing` -> `served`) |
| `GET /api/users` | API Action | Administrator | View registered customer and staff account list |
| `PATCH /api/users/[id]` | API Action | Administrator | Modify user role or account status |
| `DELETE /api/users/[id]` | API Action | Administrator | Delete user account |

---

## 2. The Four Security Layers & What Each Layer Proves

Addis Eats enforces a strict **Defense-in-Depth** model across 4 distinct layers:

```
[Request] ──► Layer 1: Network / Edge Middleware (`src/proxy.js`)
                └─► Proves: Valid, tamper-proof, non-expired JWT cookie
            ──► Layer 2: Server Component Layout Guard (`src/app/admin/layout.js`)
                └─► Proves: Role membership (`session.user.role === 'admin'`)
            ──► Layer 3: API Route Handler Authorization (`src/app/api/*`)
                └─► Proves: Mutation permission & valid payload contract
            ──► Layer 4: Object-Level Authorization (`src/lib/ordersStore.js`)
                └─► Proves: Resource ownership (Tenant/Customer isolation)
```

### Layer 1: Network / Edge Middleware (`src/proxy.js`)
* **What it proves:** Proves that the incoming HTTP request originates from a client possessing a cryptographically signed, unexpired `session_token` cookie.
* **Mechanism:** Intercepts matching routes (`/admin/:path*`, `/checkout`, `/order-history`) at the network boundary before React Server Components execute.
* **Failure response:** Immediately halts the request and issues a `307 Temporary Redirect` to `/login?redirect=${pathname}`.

### Layer 2: Server Component Layout Guard (`src/app/admin/layout.js`)
* **What it proves:** Proves that the authenticated user possesses the specific administrative role (`role === "admin"`).
* **Mechanism:** Reads the verified session on the server via `getSession()` in `src/app/admin/layout.js`.
* **Failure response:** If unauthenticated, redirects to `/login`. If authenticated as a customer without admin privileges, renders a strict `403 Forbidden` Server Component without mounting operations data or leaking server state.

### Layer 3: API Route Handler Independent Authorization (`src/app/api/*`)
* **What it proves:** Proves that the API caller has explicit permission to execute the specific HTTP method (POST, PATCH, DELETE), independent of any client UI state.
* **Mechanism:** Every handler independently invokes `getSession()` and verifies `session.user?.role === "admin"` before executing any mutation logic.
* **Failure response:** Returns JSON `{ success: false, error: "Unauthorized" }` (`401`) or `{ success: false, error: "Forbidden: Administrator privileges required" }` (`403`).

### Layer 4: Object-Level Data Store Authorization (`src/lib/ordersStore.js`)
* **What it proves:** Proves that the requesting entity is either the legitimate owner of the resource or an authorized administrator (prevents Insecure Direct Object Reference).
* **Mechanism:** `canAccessOrder(order, session)` verifies that `order.customer?.email === session.user.email` or `session.user.role === "admin"`.
* **Failure response:** Returns `null` or 403 Forbidden, concealing foreign customer orders.

---

## 3. The Three Attacks & The Exact Line That Stopped Each One

### Attack 1: Privilege Escalation via Cookie Tampering (Forged JWT)
* **The Attack Scenario:** An attacker creates a modified client cookie containing `{"role": "admin", "email": "attacker@hack.com"}` or alters their existing customer token in browser storage, attempting to view `/admin/dashboard` or invoke `POST /api/dishes`.
* **How It Was Stopped:** HMAC-SHA256 signature verification detects payload tampering and immediately discards the token.
* **The Exact Line That Stopped It:**
  ```javascript
  // File: src/lib/session.js — Line 93-98
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;
  ```
  *Why this stopped it:* If the cryptographic signature fails against `process.env.SESSION_SECRET`, `verifyToken` returns `null`. The session is treated as non-existent, rejecting all access.

---

### Attack 2: Insecure Direct Object Reference (IDOR) on Order Inspection & SSE Streaming
* **The Attack Scenario:** Customer A (authenticated with order `#ORD-1001`) notices sequential IDs and attempts to view or stream Customer B's order `#ORD-1002` by issuing a direct request to `GET /api/orders/ORD-1002` or `GET /api/orders/ORD-1002/stream`.
* **How It Was Stopped:** Object-level ownership validation checks customer identity against session email/ID before returning order details or subscribing to the SSE event emitter.
* **The Exact Line That Stopped It:**
  ```javascript
  // File: src/lib/ordersStore.js — Line 241-244
  if (session.user.role !== "admin" && order.customer?.email !== session.user.email && order.customerId !== session.user.id) {
    return null;
  }
  ```
  *Why this stopped it:* Even if the attacker knows a valid foreign `orderId`, access evaluates to `null` and the API responds with `404 Not Found` / `403 Forbidden`, preventing unauthorized order data exfiltration.

---

### Attack 3: UI-Bypass Direct API Mutation Injection (CSRF / Unauthorized REST Request)
* **The Attack Scenario:** A rogue user bypasses the disabled client buttons or browser UI and uses `curl` or Postman to send `DELETE /api/dishes/special-burger` or `POST /api/dishes` to modify menu catalog prices.
* **How It Was Stopped:** Zero-trust server-side validation checks session identity and administrator privileges on every mutation before disk persistence.
* **The Exact Line That Stopped It:**
  ```javascript
  // File: src/app/api/dishes/route.js — Line 82-90
  if (!session || !session.isAuthenticated || session.user?.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Administrator privileges required to add menu dishes." },
      { status: 403 }
    );
  }
  ```
  *Why this stopped it:* The route handler treats every incoming request as untrusted; lack of verified administrative credentials results in an immediate 403 response without accessing `dishStorage.js`.
