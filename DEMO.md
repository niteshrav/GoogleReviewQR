# TrustTap — Phase 2 Demo Setup

Quick guide to get the full demo running locally in under 5 minutes.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`)

---

## Step 1 — Start the database

Open a terminal in the project root and run:

```powershell
docker compose up -d
```

Verify it's running:

```powershell
docker ps
# Should show: feedbackflow-postgres   Up
```

---

## Step 2 — Install dependencies (first time only)

```powershell
npm install
```

---

## Step 3 — Run migrations

```powershell
npm run db:migrate
```

If prompted for a migration name, type: `phase2_billing_alerts`

---

## Step 4 — Seed demo data

```powershell
npx tsx backend/scripts/seed-demo.ts
```

This creates **3 pilot businesses** with realistic feedback, ratings, alerts, and billing statuses.

---

## Step 5 — Start the dev server

```powershell
npm run dev
```

Open: **http://localhost:3000**

---

## Demo credentials

| Screen | URL | Password |
|--------|-----|----------|
| Admin dashboard | http://localhost:3000/admin | `demo-admin-secret-2026` |
| Customer review (Cafe Edelweiss) | http://localhost:3000/r/cafe-edelweiss | — |
| Customer review (JMB Cafe) | http://localhost:3000/r/jmb-cafe | — |
| Customer review (Lakeview Bistro) | http://localhost:3000/r/lakeview-bistro | — |

---

## Phase 2 features to demo

### Admin dashboard → http://localhost:3000/admin
- KPI cards: businesses, feedback count, avg rating, Google clicks
- Activity bar chart (last 14 days)
- Billing status breakdown (Trial / Invoiced / Paid / Overdue)
- Recent feedback with rating chips
- Recent businesses with plan + status badges
- **"Send all weekly reports"** button → sends report to all active businesses

### Businesses → http://localhost:3000/admin/businesses
- Each card shows plan badge + billing status badge
- **Download QR** → PNG for printing
- **Export CSV** → download all feedback as spreadsheet
- **Staff one-pager** → printable setup sheet for the merchant
- **UPI invoice** → printable manual billing invoice
- **Case study** → printable portfolio one-pager with stats + quote
- **Send report now** → sends weekly report just for that business

### Customer flow → http://localhost:3000/r/cafe-edelweiss
1. Customer arrives at landing page
2. Happy (4-5 stars) → Google review opens
3. Unhappy (1-3 stars) → Private feedback form → Owner gets WhatsApp/SMS alert (logged to console in demo)

### Email (log mode for demo)
Demo uses `ALERT_EMAIL_MODE=log` so no real emails are sent.  
Check the **terminal / server console** for lines like:
```
[smtp] EMAIL to=owner@business.com
[smtp]   Subject: TrustTap weekly report — ...
```
Use this as proof that email payload is generated correctly.

---

## Billing status flow (for demo)

1. New business starts as **Trial / Pilot**
2. Edit business → set plan to **Core** or **Premium**, billing status to **Invoiced**
3. Print UPI invoice → share with client
4. After UPI payment lands → set billing status to **Paid**
5. If payment missed → set to **Overdue** (shows red badge on dashboard)

---

## Stopping

```powershell
# Stop dev server: Ctrl+C in terminal
# Stop database:
docker compose down
```

Data persists in the Docker volume. Run `docker compose up -d` next time to resume.
