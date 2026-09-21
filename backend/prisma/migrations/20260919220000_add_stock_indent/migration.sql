-- Stock Indent module: internal material-request/approval workflow.
-- No customer, no tax fields — fromOutletId/toOutletId/locationId are plain
-- validated ID strings (checked against real Outlet rows at write time),
-- not formal FKs, matching the existing quotationRef/salesOrderRef pattern.

CREATE TABLE "StockIndent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "indentDate" TIMESTAMP(3) NOT NULL,
    "requiredDate" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "purpose" TEXT,
    "fromOutletId" TEXT NOT NULL,
    "fromOutletName" TEXT NOT NULL,
    "toOutletId" TEXT NOT NULL,
    "toOutletName" TEXT NOT NULL,
    "requestor" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "designation" TEXT,
    "referenceNo" TEXT,
    "locationId" TEXT,
    "locationName" TEXT,
    "costCenter" TEXT,
    "remarks" TEXT,
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalRequiredQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEstimatedValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockIndent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockIndentItem" (
    "id" TEXT NOT NULL,
    "indentId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "requiredQty" DECIMAL(12,2) NOT NULL,
    "availableQty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "issueWarehouse" TEXT,
    "remarks" TEXT,

    CONSTRAINT "StockIndentItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockIndent_tenantId_code_key" ON "StockIndent"("tenantId", "code");
CREATE INDEX "StockIndent_tenantId_status_idx" ON "StockIndent"("tenantId", "status");
CREATE INDEX "StockIndent_tenantId_createdAt_idx" ON "StockIndent"("tenantId", "createdAt");

CREATE INDEX "StockIndentItem_indentId_idx" ON "StockIndentItem"("indentId");

ALTER TABLE "StockIndent" ADD CONSTRAINT "StockIndent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockIndentItem" ADD CONSTRAINT "StockIndentItem_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "StockIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
