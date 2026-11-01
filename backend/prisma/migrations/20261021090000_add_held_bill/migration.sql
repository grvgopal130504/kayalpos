-- CreateEnum
CREATE TYPE "HeldBillStatus" AS ENUM ('HELD', 'RESUMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "HeldBill" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL DEFAULT 'Walk-in Customer',
    "discountType" TEXT NOT NULL DEFAULT 'amount',
    "discountValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "status" "HeldBillStatus" NOT NULL DEFAULT 'HELD',
    "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientToken" TEXT,
    "resumedById" TEXT,
    "resumedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "saleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeldBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeldBillLine" (
    "id" TEXT NOT NULL,
    "heldBillId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "HeldBillLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeldBill_saleId_key" ON "HeldBill"("saleId");

-- CreateIndex
CREATE INDEX "HeldBill_tenantId_outletId_status_idx" ON "HeldBill"("tenantId", "outletId", "status");

-- CreateIndex
CREATE INDEX "HeldBill_tenantId_userId_status_idx" ON "HeldBill"("tenantId", "userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HeldBill_tenantId_reference_key" ON "HeldBill"("tenantId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "HeldBill_tenantId_clientToken_key" ON "HeldBill"("tenantId", "clientToken");

-- CreateIndex
CREATE INDEX "HeldBillLine_heldBillId_idx" ON "HeldBillLine"("heldBillId");

-- CreateIndex
CREATE INDEX "HeldBillLine_productId_idx" ON "HeldBillLine"("productId");

-- AddForeignKey
ALTER TABLE "HeldBill" ADD CONSTRAINT "HeldBill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldBill" ADD CONSTRAINT "HeldBill_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldBill" ADD CONSTRAINT "HeldBill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldBill" ADD CONSTRAINT "HeldBill_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldBillLine" ADD CONSTRAINT "HeldBillLine_heldBillId_fkey" FOREIGN KEY ("heldBillId") REFERENCES "HeldBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeldBillLine" ADD CONSTRAINT "HeldBillLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
