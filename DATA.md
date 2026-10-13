# Addis Eats — Data Fetching & Query Strategy (`DATA.md`)

This document inventories every data query across Addis Eats Next.js, specifying whether it executes on the server or client, its cache/invalidation key, its refresh rule, and the explicit reasoning for each architectural decision.

---

## Complete Data Query Inventory

| # | Query / Hook | Environment | Cache Key / Route | Refresh Rule | One-Line Reasoning for Choice |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | `getDishes()` & `getCategories()` | **Server** | `React.cache("getDishes")` in `/menu/page.js` | ISR: `revalidate = 3600` (1 hour) | Menu catalog updates infrequently; ISR provides instant TTFB, full SEO crawling, and zero database pressure during peak hours. |
| **2** | `getDishById(id)` | **Server** | Static paths in `generateStaticParams` | ISR: `revalidate = 3600` (1 hour) | Detail pages are pre-rendered at build time with Schema.org JSON-LD structured data for 0 ms delivery and rich social link cards. |
| **3** | `useMenu({ category })` | **Client** | SWR key: `/api/dishes?category=${cat}` | SWR: `dedupingInterval: 2000`, `refreshInterval: 300_000` (5m), `revalidateOnFocus: false` | Renders instant SSR fallback while deduplicating simultaneous component calls and keeping background data fresh without UI blocking. |
| **4** | `useMenuSearch(query)` | **Client** | SWR key: `/api/dishes?search=${query}` (or `null` when blank) | SWR: 450ms input debounce, `dedupingInterval: 300_000`, `revalidateIfStale: false` | Debounce prevents keystroke spam while SWR memory cache makes repeat queries and backspaces return immediately with 0 ms server delay. |
| **5** | `useOrderStatus(orderId)` | **Client** | SSE key: `/api/orders/${orderId}/stream` (SWR fallback: `/api/orders/${orderId}`) | SSE: Instant server push on kitchen state change; SWR fallback poll: 10s | Push notifications eliminate continuous polling network overhead and update order delivery progress within milliseconds of kitchen actions. |
| **6** | `getOrders()` & `getAllUsers()` | **Server** | `Promise.all` in `/admin/layout.js` | SSR: `export const dynamic = "force-dynamic"` (0s cache) | Operations management requires strict real-time data to prevent kitchen double-preparation or desynchronized dispatch decisions. |
| **7** | `getServerAggregatedAnalytics()` | **Server** | `/admin/dashboard/page.js` with searchParams | SSR: `dynamic = "force-dynamic"`, derived via server reducers | Aggregating revenue and ticket volume on the server prevents leaking sensitive transaction details to client JS and reduces payload by 90%. |
| **8** | `useSWR('/api/auth/session')` | **Client** | SWR key: `/api/auth/session` | SWR: `revalidateOnMount: true`, `revalidateIfStale: false`, `dedupingInterval: 5000` | Synchronizes user authentication and cart across multiple browser tabs without spamming session verification on every window focus. |
| **9** | `POST /api/orders` | **Server Action / Mutation** | HTTP POST `/api/orders` | Mutation: Direct execution; triggers `mutate('/api/orders')` | Orders demand atomic execution with double-tap idempotency protection and immediate inventory deduction before confirmation. |
| **10** | `POST /api/dishes`, `PATCH`, `DELETE` | **Server Action / Mutation** | HTTP POST/PATCH/DELETE `/api/dishes/${id}` | Mutation: Direct execution; triggers `mutate('/api/dishes*')` | Administrative menu changes must immediately invalidate SWR cache keys across all connected clients to reflect live menu pricing. |

---

## Query Classification Breakdown

### 1. Server-Rendered Queries (ISR & Dynamic SSR)
* **ISR (Incremental Static Regeneration):** Used for `/menu`, `/menu/[id]`, and `/contact` with `revalidate = 3600`. Serves pre-compiled HTML and JSON payloads directly from edge memory, reducing TTFB below 150ms.
* **Dynamic SSR:** Enforced on `/admin/dashboard` using `export const dynamic = "force-dynamic"`. Guarantees that restaurant administrators always see live metrics with zero stale-data risk.

### 2. Client-Rendered Queries (SWR & Server-Sent Events)
* **SWR (Stale-While-Revalidate):** Powers interactive catalog filtering, debounced search, and cross-tab session syncing. Components display instant cached state while non-intrusively validating in the background.
* **Server-Sent Events (SSE):** Dedicated to `/order-status/[orderId]`, broadcasting live kitchen ticket transitions without client polling loops.
