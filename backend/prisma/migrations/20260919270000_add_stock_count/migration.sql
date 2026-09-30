-- Stock Count module: a physical stock-take (cycle count/audit) comparing
-- System Qty against a real Counted Qty — a reconciliation record, not a
-- priced sales document, so there's no discount/tax anywhere on it.
-- warehouse/department/costCenter/countReason/countType/countBy have no
-- backing master table (same fixed-dropdown convention as Stock Wastage/
-- Stock Return/Stock Receipt). preparedBy/approvedBy are plain user-typed
-- text, never auto-stamped. Every quantity/cost field on a line (systemQty,
-- countedQty, unitCost) is user-entered; only varianceQty/varianceValue are
-- server-computed.

CREATE TABLE "StockCount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countDate" TIMESTAMP(3) NOT NULL,
    "warehouse" TEXT NOT NULL,
    "department" TEXT,
    "costCenter" TEXT,
    "countReason" TEXT NOT NULL,
    "countRemarks" TEXT,
    "countType" TEXT NOT NULL,
    "countBy" TEXT NOT NULL,
    "binRack" TEXT,
    "startCountTime" TEXT,
    "endCountTime" TEXT,
    "referenceNo" TEXT,
    "preparedBy" TEXT,
    "approvedBy" TEXT,
    "otherNotes" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalSystemQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCountedQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalVarianceQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalVarianceValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCountValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockCount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockCountItem" (
    "id" TEXT NOT NULL,
    "countId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "systemQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "countedQty" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "varianceQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "varianceValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,

    CONSTRAINT "StockCountItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockCount_tenantId_code_key" ON "StockCount"("tenantId", "code");
CREATE INDEX "StockCount_tenantId_status_idx" ON "StockCount"("tenantId", "status");
CREATE INDEX "StockCount_tenantId_createdAt_idx" ON "StockCount"("tenantId", "createdAt");

CREATE INDEX "StockCountItem_countId_idx" ON "StockCountItem"("countId");

ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockCountItem" ADD CONSTRAINT "StockCountItem_countId_fkey" FOREIGN KEY ("countId") REFERENCES "StockCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
