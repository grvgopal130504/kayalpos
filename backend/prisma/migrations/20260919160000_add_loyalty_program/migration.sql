-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "earnPointsOn" TEXT NOT NULL,
    "pointsType" TEXT NOT NULL,
    "pointsValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "redemptionType" TEXT NOT NULL,
    "redemptionValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minimumPointsRequired" INTEGER NOT NULL DEFAULT 0,
    "maximumDiscountPerTransaction" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "applyOn" TEXT NOT NULL DEFAULT 'all',
    "membershipValidity" TEXT NOT NULL,
    "validityPeriodMonths" INTEGER NOT NULL DEFAULT 0,
    "pointsExpiry" TEXT NOT NULL,
    "welcomePointsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "welcomePointsValue" INTEGER NOT NULL DEFAULT 0,
    "allowPointsRedemption" BOOLEAN NOT NULL DEFAULT true,
    "showLoyaltyDetailsInInvoice" BOOLEAN NOT NULL DEFAULT true,
    "allowNegativePoints" BOOLEAN NOT NULL DEFAULT false,
    "pointsExpiryNotification" BOOLEAN NOT NULL DEFAULT true,
    "membersEnrolled" INTEGER NOT NULL DEFAULT 0,
    "pointsIssuedTillDate" INTEGER NOT NULL DEFAULT 0,
    "pointsRedeemedTillDate" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoyaltyProgram_tenantId_createdAt_idx" ON "LoyaltyProgram"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "LoyaltyProgram_tenantId_name_idx" ON "LoyaltyProgram"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_tenantId_code_key" ON "LoyaltyProgram"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
