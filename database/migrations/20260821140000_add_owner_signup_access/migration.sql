-- AlterTable
ALTER TABLE "Business" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Business" ADD COLUMN "ownerAccessSecret" TEXT;
ALTER TABLE "Business" ADD COLUMN "ownerSessionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_ownerSessionToken_key" ON "Business"("ownerSessionToken");
