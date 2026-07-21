-- Initial schema for Commiters FeedbackFlow Phase 1 MVP

CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerWhatsApp" TEXT,
    "googleReviewUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" VARCHAR(1000),
    "clickedGoogle" BOOLEAN NOT NULL DEFAULT false,
    "locationLabel" TEXT DEFAULT 'main',
    "alertSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

CREATE INDEX "Business_isActive_idx" ON "Business"("isActive");

CREATE INDEX "Feedback_businessId_createdAt_idx" ON "Feedback"("businessId", "createdAt" DESC);

CREATE INDEX "Feedback_alertSentAt_idx" ON "Feedback"("alertSentAt");

ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
