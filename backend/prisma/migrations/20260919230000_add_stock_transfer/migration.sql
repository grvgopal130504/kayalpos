-- Stock Transfer module: a goods movement between outlets/warehouses.
-- No customer, no tax fields — fromOutletId/toOutletId are plain validated
-- ID strings (checked against real Outlet rows at write time), not formal
-- FKs, matching Stock Indent's own fromOutletId/toOutletId pattern.

CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "indentRef" TEXT,
    "fromOutletId" TEXT NOT NULL,
    "fromOutletName" TEXT NOT NULL,
    "toOutletId" TEXT NOT NULL,
    "toOutletName" TEXT NOT NULL,
    "department" TEXT,
    "purpose" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "referenceNo" TEXT,
    "costCenter" TEXT,
    "remarks" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalTransferQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEstimatedValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "receivedBy" TEXT,
    "receivedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "transferQty" DECIMAL(12,2) NOT NULL,
    "availableQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockTransfer_tenantId_code_key" ON "StockTransfer"("tenantId", "code");
CREATE INDEX "StockTransfer_tenantId_status_idx" ON "StockTransfer"("tenantId", "status");
CREATE INDEX "StockTransfer_tenantId_createdAt_idx" ON "StockTransfer"("tenantId", "createdAt");

CREATE INDEX "StockTransferItem_transferId_idx" ON "StockTransferItem"("transferId");

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StockTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
