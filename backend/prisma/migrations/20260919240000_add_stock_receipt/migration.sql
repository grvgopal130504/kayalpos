-- Stock Receipt module: recording goods received from a supplier (a GRN).
-- supplierId/fromOutletId are plain validated ID strings (checked against
-- real Supplier/Outlet rows at write time), not formal FKs, matching Stock
-- Indent/Stock Transfer's own outlet-reference pattern. Every quantity/cost
-- field on a line (orderedQty, receivedQty, unitCost, discount, tax) is
-- user-entered off the real invoice/GRN, not a Product-master lookup — only
-- totalCost is server-computed.

CREATE TABLE "StockReceipt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "purchaseType" TEXT NOT NULL,
    "purchaseInvoiceNo" TEXT,
    "purchaseInvoiceDate" TIMESTAMP(3),
    "grnDcNo" TEXT,
    "grnDcDate" TIMESTAMP(3),
    "receiptRemarks" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "fromOutletId" TEXT NOT NULL,
    "fromOutletName" TEXT NOT NULL,
    "costCenter" TEXT,
    "contactPerson" TEXT,
    "mobileNo" TEXT,
    "referenceNo" TEXT,
    "vehicleNo" TEXT,
    "transporter" TEXT,
    "deliveryChallanNo" TEXT,
    "otherRemarks" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalReceivedQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEstimatedValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "receivedBy" TEXT,
    "receivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "orderedQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "warehouse" TEXT,
    "batchNo" TEXT,
    "expiryDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "StockReceiptItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockReceipt_tenantId_code_key" ON "StockReceipt"("tenantId", "code");
CREATE INDEX "StockReceipt_tenantId_status_idx" ON "StockReceipt"("tenantId", "status");
CREATE INDEX "StockReceipt_tenantId_createdAt_idx" ON "StockReceipt"("tenantId", "createdAt");

CREATE INDEX "StockReceiptItem_receiptId_idx" ON "StockReceiptItem"("receiptId");

ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockReceiptItem" ADD CONSTRAINT "StockReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "StockReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
