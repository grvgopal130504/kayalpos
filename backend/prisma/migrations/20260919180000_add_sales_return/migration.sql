-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "returnNo" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL DEFAULT 'Walk-in Customer',
    "cashierName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "refundMode" TEXT NOT NULL,
    "refundTo" TEXT,
    "subTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "saleLineId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SalesReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesReturn_tenantId_createdAt_idx" ON "SalesReturn"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesReturn_tenantId_saleId_idx" ON "SalesReturn"("tenantId", "saleId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_tenantId_returnNo_key" ON "SalesReturn"("tenantId", "returnNo");

-- CreateIndex
CREATE INDEX "SalesReturnItem_returnId_idx" ON "SalesReturnItem"("returnId");

-- CreateIndex
CREATE INDEX "SalesReturnItem_saleLineId_idx" ON "SalesReturnItem"("saleLineId");

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_saleLineId_fkey" FOREIGN KEY ("saleLineId") REFERENCES "SaleLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
