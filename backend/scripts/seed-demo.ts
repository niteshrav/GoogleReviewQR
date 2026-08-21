/**
 * Demo seed — rich data for Phase 2 demo.
 *
 * Creates 3 pilot businesses with realistic feedback entries spread over 14 days.
 * Safe to re-run (upserts businesses, skips existing feedback).
 *
 * Usage:
 *   npm run db:migrate
 *   npx tsx backend/scripts/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Helpers
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ── Business data ──────────────────────────────────────────────────────────────

const businesses = [
  {
    slug: "cafe-edelweiss",
    name: "Cafe Edelweiss",
    ownerEmail: "owner@cafe-edelweiss.com",
    ownerWhatsApp: "+919876543210",
    ownerSmsPhone: "+919876543210",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=DEMO1",
    isActive: true,
    plan: "premium",
    billingStatus: "paid",
    setupFeePaid: true,
  },
  {
    slug: "jmb-cafe",
    name: "JMB Cafe",
    ownerEmail: "owner@jmbcafe.com",
    ownerWhatsApp: "+919876543211",
    ownerSmsPhone: null,
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=DEMO2",
    isActive: true,
    plan: "core",
    billingStatus: "invoiced",
    setupFeePaid: true,
  },
  {
    slug: "lakeview-bistro",
    name: "Lakeview Bistro",
    ownerEmail: "owner@lakeviewbistro.com",
    ownerWhatsApp: null,
    ownerSmsPhone: "+919876543212",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=DEMO3",
    isActive: true,
    plan: "pilot",
    billingStatus: "trial",
    setupFeePaid: false,
  },
];

// ── Feedback templates ──────────────────────────────────────────────────────────

const positiveFeedback = [
  { rating: 5, comment: "Amazing coffee and great vibes! Will definitely come back.", name: "Priya S", phone: "+9198765xxxxx" },
  { rating: 5, comment: "Best cappuccino in town. Staff was super friendly.", name: "Rahul M", phone: null },
  { rating: 5, comment: "Loved the ambiance. The chocolate cake was phenomenal.", name: "Anjali K", phone: "+9187654xxxxx" },
  { rating: 4, comment: "Good food, slight wait time but worth it.", name: "Sameer P", phone: null },
  { rating: 5, comment: "Came for a business meeting — perfect quiet space.", name: "Meera R", phone: "+9176543xxxxx" },
  { rating: 4, comment: "Nice place. The wifi could be faster though.", name: "Karan T", phone: null },
  { rating: 5, comment: "Excellent service! The owner personally checked on us.", name: "Divya N", phone: "+9165432xxxxx" },
  { rating: 4, comment: "Great for a Sunday brunch. Loved the eggs Benedict.", name: "Arun V", phone: null },
];

const negativeFeedback = [
  { rating: 2, comment: "Waited 30 minutes for a simple sandwich. Unacceptable.", name: "Vikram S", phone: "+9154321xxxxx" },
  { rating: 1, comment: "The table was dirty and nobody cleaned it for 15 minutes.", name: "Neha G", phone: null },
  { rating: 2, comment: "Food was cold when it arrived. Needs improvement.", name: "Rohit B", phone: "+9143210xxxxx" },
  { rating: 3, comment: "Average experience. Nothing special but nothing terrible.", name: "Pooja L", phone: null },
  { rating: 2, comment: "The AC was too cold and nobody responded when we asked.", name: "Amit D", phone: "+9132109xxxxx" },
];

const googleOnlyFeedback = [
  { rating: null, comment: null, name: null, phone: null, clickedGoogle: true },
  { rating: null, comment: null, name: "Sneha W", phone: null, clickedGoogle: true },
  { rating: null, comment: null, name: null, phone: null, clickedGoogle: true },
];

async function main() {
  console.log("🌱 Seeding demo data...\n");

  // Upsert businesses
  const createdBusinesses: { id: string; slug: string; name: string }[] = [];
  for (const biz of businesses) {
    const record = await db.business.upsert({
      where: { slug: biz.slug },
      update: biz,
      create: biz,
      select: { id: true, slug: true, name: true },
    });
    createdBusinesses.push(record);
    console.log(`✓ Business: ${biz.name} (${biz.plan} / ${biz.billingStatus})`);
  }

  // Seed feedback for each business
  const feedbackByBiz = [
    // Cafe Edelweiss — premium, lots of activity
    {
      slug: "cafe-edelweiss",
      entries: [
        ...positiveFeedback.slice(0, 6).map((f, i) => ({ ...f, clickedGoogle: false, daysAgo: i + 1 })),
        ...negativeFeedback.slice(0, 3).map((f, i) => ({ ...f, clickedGoogle: false, daysAgo: i + 2 })),
        ...googleOnlyFeedback.map((f, i) => ({ ...f, daysAgo: i + 1 })),
        // Extra recent ones
        { ...positiveFeedback[0]!, clickedGoogle: true, daysAgo: 0 },
        { ...positiveFeedback[1]!, clickedGoogle: false, daysAgo: 0 },
        { ...negativeFeedback[3]!, clickedGoogle: false, daysAgo: 1 },
      ],
    },
    // JMB Cafe — core plan, moderate activity
    {
      slug: "jmb-cafe",
      entries: [
        ...positiveFeedback.slice(3, 7).map((f, i) => ({ ...f, clickedGoogle: false, daysAgo: i + 2 })),
        ...negativeFeedback.slice(1, 3).map((f, i) => ({ ...f, clickedGoogle: false, daysAgo: i + 3 })),
        ...googleOnlyFeedback.slice(0, 2).map((f, i) => ({ ...f, daysAgo: i + 2 })),
        { ...positiveFeedback[5]!, clickedGoogle: false, daysAgo: 0 },
      ],
    },
    // Lakeview Bistro — pilot, light activity
    {
      slug: "lakeview-bistro",
      entries: [
        ...positiveFeedback.slice(1, 4).map((f, i) => ({ ...f, clickedGoogle: false, daysAgo: i + 4 })),
        { ...negativeFeedback[4]!, clickedGoogle: false, daysAgo: 5 },
        { ...googleOnlyFeedback[0]!, daysAgo: 3 },
      ],
    },
  ];

  for (const bizFeedback of feedbackByBiz) {
    const biz = createdBusinesses.find((b) => b.slug === bizFeedback.slug);
    if (!biz) continue;

    let inserted = 0;
    for (const entry of bizFeedback.entries) {
      const createdAt = daysAgo(entry.daysAgo ?? 0);
      const isNegative = entry.rating != null && entry.rating <= 3;

      await db.feedback.create({
        data: {
          businessId: biz.id,
          rating: entry.rating,
          comment: entry.comment,
          customerName: entry.name,
          customerPhone: entry.phone,
          clickedGoogle: entry.clickedGoogle ?? false,
          locationLabel: "main",
          alertSentAt: isNegative ? new Date(createdAt.getTime() + 45000) : null,
          alertChannel: isNegative ? "whatsapp" : null,
          createdAt,
        },
      });
      inserted++;
    }
    console.log(`  → ${biz.name}: ${inserted} feedback entries`);
  }

  console.log("\n✅ Demo seed complete!\n");
  console.log("Demo accounts:");
  for (const biz of businesses) {
    console.log(`  /r/${biz.slug}  →  ${biz.name} (${biz.plan})`);
  }
  console.log("\nAdmin: http://localhost:3000/admin");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
