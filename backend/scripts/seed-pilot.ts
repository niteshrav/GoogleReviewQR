/**
 * Seed 3 pilot businesses after migrations.
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:seed
 *
 * Replace PLACE_ID and owner contacts before production print.
 */

import { PrismaClient } from "@prisma/client";
import { PILOT_BUSINESSES } from "../lib/fixtures/pilot-businesses";

const db = new PrismaClient();

async function main() {
  for (const business of PILOT_BUSINESSES) {
    await db.business.upsert({
      where: { slug: business.slug },
      update: business,
      create: business,
    });
  }

  console.log(`Seeded ${PILOT_BUSINESSES.length} pilot businesses.`);
  for (const business of PILOT_BUSINESSES) {
    console.log(`  - /r/${business.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
