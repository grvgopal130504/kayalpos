-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT,
    "salesPerson" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "quotationRef" TEXT,
    "referenceDate" TIMESTAMP(3),
    "priceList" TEXT,
    "remarks" TEXT,
    "notes" TEXT,
    "subTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "extraDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdBy" TEXT NOT NULL,
    "deliveredOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "qty" DECIMAL(12,2) NOT NULL,
    "unit" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxCode" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesOrder_tenantId_status_idx" ON "SalesOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SalesOrder_tenantId_createdAt_idx" ON "SalesOrder"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesOrder_tenantId_customerId_idx" ON "SalesOrder"("tenantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_tenantId_code_key" ON "SalesOrder"("tenantId", "code");

-- CreateIndex
CREATE INDEX "SalesOrderItem_orderId_idx" ON "SalesOrderItem"("orderId");

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
