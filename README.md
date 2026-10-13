# Addis Eats — Restaurant & Real-Time Delivery Platform

## What It Is
**Addis Eats** is a production-grade Ethiopian culinary restaurant web application built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS**. It provides an authentic dining and delivery experience with Ethiopian Birr (`ETB`) pricing, ISR-cached menu catalogs (`revalidate = 3600`), debounced SWR client search, an accessible keyboard-navigable checkout with double-tap idempotency protection, real-time Server-Sent Events (SSE) order status tracking, and a secure executive operations dashboard guarded by defense-in-depth authentication.

* **Live Production URL:** [https://addis-eats-nextjs-project.vercel.app](https://addis-eats-nextjs-project.vercel.app)
* **GitHub Repository:** [https://github.com/Michael-devoop/ADDIS-EATS-NEXTJS-PROJECT](https://github.com/Michael-devoop/ADDIS-EATS-NEXTJS-PROJECT)

---

## How to Run from a Fresh Clone

Follow these steps to run the application locally from a clean clone:

```bash
# 1. Clone the repository and enter the project folder
git clone https://github.com/Michael-devoop/ADDIS-EATS-NEXTJS-PROJECT.git
cd ADDIS-EATS-NEXTJS-PROJECT

# 2. Configure environment variables from template
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Verify clean production build
npm run build

# 5. Start the production server (or npm run dev for local development)
npm run start
```
The server will boot at `http://localhost:3000`.

---

## Environment Variables

Configure these variables in your deployment settings (e.g. Vercel Project Settings) or `.env.local`:

| Variable | Scope | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `SITE_URL` | Server Only | No (defaults to Vercel URL) | Canonical site URL used for sitemap, robots, OpenGraph cards, and Schema.org JSON-LD. Never leaked to client JS bundles. |
| `SESSION_SECRET` | Server Only | **Yes** | 32+ char HMAC-SHA256 cryptographic secret for HttpOnly cookie signing. |
| `ADMIN_API_KEY` | Server Only | **Yes** | Server secret token for privileged backend administrative mutations. |
| `NEXT_PUBLIC_APP_NAME` | Public / Client | No | Application branding title (defaults to `Addis Eats`). |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Public / Client | No | Primary display currency (`ETB` or `USD`). |

> **Security Rule:** Server-only configurations and secrets (`SITE_URL`, `SESSION_SECRET`, `ADMIN_API_KEY`) must **never** be prefixed with `NEXT_PUBLIC_` to prevent bundling into client JavaScript.

---

## Pre-Flight Demo Credentials

* **Administrator Account:** `admin@addiseats.com` | Password: `admin123` (Accesses `/admin/dashboard`)
* **Customer Account:** `customer@addiseats.com` | Password: `password123` (Accesses `/order-history`, `/checkout`)

---

## Architecture Documentation

* [`AUTH.md`](./AUTH.md) — Private routes, authorization layers, and the exact lines stopping forged cookies, IDOR, and API injection.
* [`DATA.md`](./DATA.md) — Query inventory (Server vs Client), SWR cache keys, refresh policies, and architectural rationales.
* [`PERF.md`](./PERF.md) — Production performance budget comparing target budgets against deployed build metrics with root cause analysis.
