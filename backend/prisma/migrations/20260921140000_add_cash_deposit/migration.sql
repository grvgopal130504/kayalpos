-- CreateTable
CREATE TABLE "CashDeposit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "shiftSessionId" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL DEFAULT 'cash',
    "bankAccount" TEXT,
    "remarks" TEXT,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashDeposit_tenantId_referenceNo_key" ON "CashDeposit"("tenantId", "referenceNo");

-- CreateIndex
CREATE INDEX "CashDeposit_tenantId_outletId_idx" ON "CashDeposit"("tenantId", "outletId");

-- CreateIndex
CREATE INDEX "CashDeposit_tenantId_shiftSessionId_idx" ON "CashDeposit"("tenantId", "shiftSessionId");

-- CreateIndex
CREATE INDEX "CashDeposit_tenantId_createdAt_idx" ON "CashDeposit"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "CashDeposit" ADD CONSTRAINT "CashDeposit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashDeposit" ADD CONSTRAINT "CashDeposit_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashDeposit" ADD CONSTRAINT "CashDeposit_shiftSessionId_fkey" FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
