-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "priceInr" INTEGER NOT NULL,
    "setupFeeInr" INTEGER NOT NULL DEFAULT 2999,
    "features" TEXT[],
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_key_key" ON "SubscriptionPlan"("key");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isPublic_sortOrder_idx" ON "SubscriptionPlan"("isPublic", "sortOrder");

-- Seed default TrustTap plans
INSERT INTO "SubscriptionPlan" ("id", "key", "name", "tagline", "priceInr", "setupFeeInr", "features", "highlighted", "isPublic", "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid()::text,
    'pilot',
    'Pilot',
    'Try TrustTap with one location.',
    0,
    2999,
    ARRAY[
      '1 QR landing page',
      'Private feedback + Google CTA',
      'Owner email alerts',
      'Admin dashboard access'
    ],
    false,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'core',
    'Core',
    'Best for cafes and local shops going live.',
    499,
    2999,
    ARRAY[
      'Everything in Pilot',
      'WhatsApp / SMS low-rating alerts',
      'QR PNG export for print',
      'UPI invoice + payment tracking'
    ],
    true,
    true,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    gen_random_uuid()::text,
    'premium',
    'Premium',
    'Weekly reports and priority support.',
    999,
    2999,
    ARRAY[
      'Everything in Core',
      'Weekly owner report (WhatsApp + email)',
      'Priority support from Commiters',
      'Case study + merchant one-pager'
    ],
    false,
    true,
    3,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
