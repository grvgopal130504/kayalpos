-- CreateEnum
CREATE TYPE "PricingMethod" AS ENUM ('FIXED', 'MARGIN_FROM_MRP', 'MARGIN_FROM_COST');

-- CreateTable
CREATE TABLE "SellingPrice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceList" TEXT NOT NULL,
    "outletId" TEXT,
    "mrp" DECIMAL(12,2) NOT NULL,
    "purchaseCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxCode" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "pricingMethod" "PricingMethod" NOT NULL DEFAULT 'MARGIN_FROM_MRP',
    "marginPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sellingPriceExclTax" DECIMAL(12,2) NOT NULL,
    "sellingPriceInclTax" DECIMAL(12,2) NOT NULL,
    "rounding" TEXT NOT NULL DEFAULT 'Round to 2 Decimal',
    "priceUpdateReason" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellingPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellingPrice_tenantId_status_idx" ON "SellingPrice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SellingPrice_tenantId_productId_idx" ON "SellingPrice"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "SellingPrice_outletId_idx" ON "SellingPrice"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "SellingPrice_tenantId_productId_priceList_outletId_key" ON "SellingPrice"("tenantId", "productId", "priceList", "outletId");

-- AddForeignKey
ALTER TABLE "SellingPrice" ADD CONSTRAINT "SellingPrice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellingPrice" ADD CONSTRAINT "SellingPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellingPrice" ADD CONSTRAINT "SellingPrice_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
