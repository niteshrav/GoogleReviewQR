-- Phase 2: manual billing + weekly report tracking + alert delivery channel
ALTER TABLE "Business" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'pilot';
ALTER TABLE "Business" ADD COLUMN "billingStatus" TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE "Business" ADD COLUMN "setupFeePaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN "lastWeeklyReportAt" TIMESTAMP(3);

ALTER TABLE "Feedback" ADD COLUMN "alertChannel" TEXT;
