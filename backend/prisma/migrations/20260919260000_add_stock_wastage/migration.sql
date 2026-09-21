-- Stock Wastage module: recording goods written off as wastage (expired,
-- damaged, spoiled, etc.) — a stock write-off, not a priced sales document,
-- so there's no discount/tax on the line. outletId is a plain validated ID
-- string (checked against a real Outlet row at write time), not a formal
-- FK, matching every other stock-movement module's outlet reference
-- pattern. preparedBy/approvedBy are plain user-typed text, never
-- auto-stamped. Every quantity/cost field on a line (availableQty,
-- wastageQty, unitCost) is user-entered; only totalValue is server-computed
-- (wastageQty * unitCost — no discount/tax on a write-off).

CREATE TABLE "StockWastage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "wastageDate" TIMESTAMP(3) NOT NULL,
    "wastageType" TEXT NOT NULL,
    "department" TEXT,
    "costCenter" TEXT,
    "wastageReason" TEXT,
    "wastageRemarks" TEXT,
    "outletId" TEXT NOT NULL,
    "outletName" TEXT NOT NULL,
    "warehouse" TEXT,
    "binRack" TEXT,
    "referenceNo" TEXT,
    "preparedBy" TEXT,
    "approvedBy" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalWastageQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockWastage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockWastageItem" (
    "id" TEXT NOT NULL,
    "wastageId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "batchNo" TEXT,
    "expiryDate" TIMESTAMP(3),
    "availableQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "wastageQty" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,

    CONSTRAINT "StockWastageItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockWastage_tenantId_code_key" ON "StockWastage"("tenantId", "code");
CREATE INDEX "StockWastage_tenantId_status_idx" ON "StockWastage"("tenantId", "status");
CREATE INDEX "StockWastage_tenantId_createdAt_idx" ON "StockWastage"("tenantId", "createdAt");

CREATE INDEX "StockWastageItem_wastageId_idx" ON "StockWastageItem"("wastageId");

ALTER TABLE "StockWastage" ADD CONSTRAINT "StockWastage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockWastageItem" ADD CONSTRAINT "StockWastageItem_wastageId_fkey" FOREIGN KEY ("wastageId") REFERENCES "StockWastage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
