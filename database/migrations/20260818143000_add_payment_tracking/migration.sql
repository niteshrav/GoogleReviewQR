-- Payment tracking fields for manual billing workflow
ALTER TABLE "Business" ADD COLUMN "lastInvoiceSentAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN "paymentReceivedAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN "paymentAmountInr" INTEGER;
ALTER TABLE "Business" ADD COLUMN "paymentReference" TEXT;
