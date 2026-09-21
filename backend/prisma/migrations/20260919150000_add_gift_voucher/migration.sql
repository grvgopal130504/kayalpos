-- CreateTable
CREATE TABLE "GiftVoucher" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "voucherType" TEXT NOT NULL,
    "voucherValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "noExpiry" BOOLEAN NOT NULL DEFAULT false,
    "minimumBillAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maximumUsage" TEXT NOT NULL DEFAULT 'no-limit',
    "onePerCustomer" BOOLEAN NOT NULL DEFAULT false,
    "partialRedemptionAllowed" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleInOneBill" BOOLEAN NOT NULL DEFAULT true,
    "applicableTo" TEXT NOT NULL DEFAULT 'all',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sendSms" BOOLEAN NOT NULL DEFAULT false,
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GiftVoucher_tenantId_createdAt_idx" ON "GiftVoucher"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "GiftVoucher_tenantId_name_idx" ON "GiftVoucher"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GiftVoucher_tenantId_code_key" ON "GiftVoucher"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "GiftVoucher" ADD CONSTRAINT "GiftVoucher_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
