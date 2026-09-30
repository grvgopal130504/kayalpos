-- CreateTable
CREATE TABLE "CashTransfer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "shiftSessionId" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL DEFAULT 'cash',
    "remarks" TEXT,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashTransfer_tenantId_referenceNo_key" ON "CashTransfer"("tenantId", "referenceNo");

-- CreateIndex
CREATE INDEX "CashTransfer_tenantId_outletId_idx" ON "CashTransfer"("tenantId", "outletId");

-- CreateIndex
CREATE INDEX "CashTransfer_tenantId_shiftSessionId_idx" ON "CashTransfer"("tenantId", "shiftSessionId");

-- CreateIndex
CREATE INDEX "CashTransfer_tenantId_createdAt_idx" ON "CashTransfer"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "CashTransfer" ADD CONSTRAINT "CashTransfer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransfer" ADD CONSTRAINT "CashTransfer_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransfer" ADD CONSTRAINT "CashTransfer_shiftSessionId_fkey" FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
