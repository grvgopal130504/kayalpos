-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "promotionType" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" TEXT NOT NULL,
    "selectedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "selectedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountUnit" TEXT NOT NULL DEFAULT '%',
    "maximumUsage" TEXT NOT NULL DEFAULT 'no-limit',
    "minimumBillAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "noExpiry" BOOLEAN NOT NULL DEFAULT false,
    "usageLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
    "usageLimitCount" INTEGER NOT NULL DEFAULT 0,
    "onePerCustomer" BOOLEAN NOT NULL DEFAULT false,
    "combinable" BOOLEAN NOT NULL DEFAULT true,
    "showInInvoice" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_tenantId_createdAt_idx" ON "Promotion"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Promotion_tenantId_name_idx" ON "Promotion"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_tenantId_code_key" ON "Promotion"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
