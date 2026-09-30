-- CreateTable
CREATE TABLE "SalesInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "salesOrderRef" TEXT,
    "quotationRef" TEXT,
    "salesPerson" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentTerms" TEXT,
    "priceList" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "referenceNo" TEXT,
    "remarks" TEXT,
    "notes" TEXT,
    "subTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "extraDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "paidOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
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

    CONSTRAINT "SalesInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesInvoice_tenantId_status_idx" ON "SalesInvoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SalesInvoice_tenantId_createdAt_idx" ON "SalesInvoice"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesInvoice_tenantId_customerId_idx" ON "SalesInvoice"("tenantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesInvoice_tenantId_code_key" ON "SalesInvoice"("tenantId", "code");

-- CreateIndex
CREATE INDEX "SalesInvoiceItem_invoiceId_idx" ON "SalesInvoiceItem"("invoiceId");

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoiceItem" ADD CONSTRAINT "SalesInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SalesInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
