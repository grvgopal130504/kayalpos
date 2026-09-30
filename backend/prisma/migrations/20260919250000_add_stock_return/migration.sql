-- Stock Return module: goods sent back to a supplier (damaged, excess,
-- expired, or a plain purchase return). supplierId/fromOutletId are plain
-- validated ID strings (checked against real Supplier/Outlet rows at write
-- time), not formal FKs, matching StockReceipt's own supplierId/
-- fromOutletId pattern. referenceType/referenceNo are free text — there is
-- no Purchase Invoice or GRN master table in this system to select from.
-- Every quantity/cost field on a line (returnedQty, unitCost, discount, tax)
-- is user-entered; only totalCost is server-computed.

CREATE TABLE "StockReturn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "returnType" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceNo" TEXT,
    "referenceDate" TIMESTAMP(3),
    "returnReason" TEXT,
    "returnRemarks" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "fromOutletId" TEXT NOT NULL,
    "fromOutletName" TEXT NOT NULL,
    "costCenter" TEXT,
    "contactPerson" TEXT,
    "mobileNo" TEXT,
    "grnDcNo" TEXT,
    "grnDcDate" TIMESTAMP(3),
    "vehicleNo" TEXT,
    "transporter" TEXT,
    "otherRemarks" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalReturnedQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "acceptedBy" TEXT,
    "acceptedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockReturn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "returnedQty" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "warehouse" TEXT,
    "batchNo" TEXT,
    "expiryDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "StockReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockReturn_tenantId_code_key" ON "StockReturn"("tenantId", "code");
CREATE INDEX "StockReturn_tenantId_status_idx" ON "StockReturn"("tenantId", "status");
CREATE INDEX "StockReturn_tenantId_createdAt_idx" ON "StockReturn"("tenantId", "createdAt");

CREATE INDEX "StockReturnItem_returnId_idx" ON "StockReturnItem"("returnId");

ALTER TABLE "StockReturn" ADD CONSTRAINT "StockReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockReturnItem" ADD CONSTRAINT "StockReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "StockReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
