-- CreateTable
CREATE TABLE "BarcodeLabelBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "labelName" TEXT NOT NULL,
    "labelType" TEXT NOT NULL DEFAULT 'barcode',
    "labelSize" TEXT NOT NULL,
    "printTemplate" TEXT,
    "labelsAcross" INTEGER,
    "labelsDown" INTEGER,
    "remarks" TEXT,
    "itemCategory" TEXT,
    "item" TEXT,
    "uom" TEXT,
    "brand" TEXT,
    "warehouse" TEXT,
    "batchNo" TEXT,
    "fromItemCode" TEXT,
    "toItemCode" TEXT,
    "barcodeType" TEXT NOT NULL DEFAULT 'ean-13',
    "additionalFilter" TEXT,
    "sortBy" TEXT NOT NULL DEFAULT 'item-name',
    "notes" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalLabels" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "printedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarcodeLabelBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarcodeLabelItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT,
    "uom" TEXT,
    "barcode" TEXT,
    "printQty" DECIMAL(12,2) NOT NULL,
    "fromSerialBatch" TEXT,
    "toSerialBatch" TEXT,

    CONSTRAINT "BarcodeLabelItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarcodeLabelBatch_tenantId_status_idx" ON "BarcodeLabelBatch"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BarcodeLabelBatch_tenantId_createdAt_idx" ON "BarcodeLabelBatch"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BarcodeLabelBatch_tenantId_code_key" ON "BarcodeLabelBatch"("tenantId", "code");

-- CreateIndex
CREATE INDEX "BarcodeLabelItem_batchId_idx" ON "BarcodeLabelItem"("batchId");

-- AddForeignKey
ALTER TABLE "BarcodeLabelBatch" ADD CONSTRAINT "BarcodeLabelBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeLabelItem" ADD CONSTRAINT "BarcodeLabelItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BarcodeLabelBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
