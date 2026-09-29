-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Business_plan_idx" ON "Business"("plan");

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineBranch" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DineBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineFloor" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DineFloor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineTable" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "floorId" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DineTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineMenuItem" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DineMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineFeedback" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "foodRating" INTEGER,
    "serviceRating" INTEGER,
    "ambienceRating" INTEGER,
    "waitTimeRating" INTEGER,
    "overallRating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "issueTags" TEXT[],
    "menuItemId" TEXT,
    "menuItemRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DineFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineIssue" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "feedbackId" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "summary" TEXT NOT NULL,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" VARCHAR(1000),
    "alertSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DineIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DineActivity" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DineActivity_pkey" PRIMARY KEY ("id")
);

-- Indexes & uniques
CREATE UNIQUE INDEX IF NOT EXISTS "DineBranch_businessId_slug_key" ON "DineBranch"("businessId", "slug");
CREATE INDEX IF NOT EXISTS "DineBranch_businessId_isActive_idx" ON "DineBranch"("businessId", "isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "DineFloor_branchId_slug_key" ON "DineFloor"("branchId", "slug");
CREATE INDEX IF NOT EXISTS "DineFloor_branchId_isActive_idx" ON "DineFloor"("branchId", "isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "DineTable_qrToken_key" ON "DineTable"("qrToken");
CREATE UNIQUE INDEX IF NOT EXISTS "DineTable_branchId_slug_key" ON "DineTable"("branchId", "slug");
CREATE UNIQUE INDEX IF NOT EXISTS "DineTable_floorId_tableNumber_key" ON "DineTable"("floorId", "tableNumber");
CREATE INDEX IF NOT EXISTS "DineTable_businessId_isActive_idx" ON "DineTable"("businessId", "isActive");
CREATE INDEX IF NOT EXISTS "DineTable_floorId_isActive_idx" ON "DineTable"("floorId", "isActive");
CREATE INDEX IF NOT EXISTS "DineTable_branchId_isActive_idx" ON "DineTable"("branchId", "isActive");

CREATE INDEX IF NOT EXISTS "DineMenuItem_businessId_isActive_idx" ON "DineMenuItem"("businessId", "isActive");
CREATE INDEX IF NOT EXISTS "DineMenuItem_branchId_isActive_idx" ON "DineMenuItem"("branchId", "isActive");

CREATE INDEX IF NOT EXISTS "DineFeedback_businessId_createdAt_idx" ON "DineFeedback"("businessId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DineFeedback_tableId_createdAt_idx" ON "DineFeedback"("tableId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DineFeedback_menuItemId_idx" ON "DineFeedback"("menuItemId");

CREATE INDEX IF NOT EXISTS "DineIssue_businessId_status_createdAt_idx" ON "DineIssue"("businessId", "status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DineIssue_tableId_status_idx" ON "DineIssue"("tableId", "status");
CREATE INDEX IF NOT EXISTS "DineIssue_createdAt_idx" ON "DineIssue"("createdAt");

CREATE INDEX IF NOT EXISTS "DineActivity_tableId_createdAt_idx" ON "DineActivity"("tableId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "DineActivity_businessId_createdAt_idx" ON "DineActivity"("businessId", "createdAt" DESC);

-- FKs
DO $$ BEGIN
  ALTER TABLE "DineBranch" ADD CONSTRAINT "DineBranch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineFloor" ADD CONSTRAINT "DineFloor_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "DineBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineTable" ADD CONSTRAINT "DineTable_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineTable" ADD CONSTRAINT "DineTable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "DineBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineTable" ADD CONSTRAINT "DineTable_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "DineFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineMenuItem" ADD CONSTRAINT "DineMenuItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineMenuItem" ADD CONSTRAINT "DineMenuItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "DineBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineFeedback" ADD CONSTRAINT "DineFeedback_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineFeedback" ADD CONSTRAINT "DineFeedback_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DineTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineFeedback" ADD CONSTRAINT "DineFeedback_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "DineMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineIssue" ADD CONSTRAINT "DineIssue_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineIssue" ADD CONSTRAINT "DineIssue_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DineTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineIssue" ADD CONSTRAINT "DineIssue_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "DineFeedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineActivity" ADD CONSTRAINT "DineActivity_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DineActivity" ADD CONSTRAINT "DineActivity_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DineTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed DinePro plan (idempotent)
INSERT INTO "SubscriptionPlan" ("id", "key", "name", "tagline", "priceInr", "setupFeeInr", "features", "highlighted", "isPublic", "sortOrder", "createdAt", "updatedAt")
VALUES (
  'dinepro-plan-0000-0000-000000000001',
  'dinepro',
  'TrustTap DinePro',
  'Every Table Tells a Story.',
  1499,
  2999,
  ARRAY[
    'Unique QR for every table',
    'Table-wise feedback',
    'Live Floor Pulse',
    'Issue alerts',
    'Table Health',
    'Food insights',
    'Restaurant analytics',
    'QR management',
    'Google review flow',
    'Daily/weekly reports'
  ],
  true,
  true,
  40,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET
  "name" = EXCLUDED."name",
  "tagline" = EXCLUDED."tagline",
  "priceInr" = EXCLUDED."priceInr",
  "setupFeeInr" = EXCLUDED."setupFeeInr",
  "features" = EXCLUDED."features",
  "highlighted" = EXCLUDED."highlighted",
  "isPublic" = EXCLUDED."isPublic",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = CURRENT_TIMESTAMP;
