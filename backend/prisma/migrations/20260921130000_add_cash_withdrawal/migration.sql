-- CreateTable
CREATE TABLE "CashWithdrawal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "shiftSessionId" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL DEFAULT 'cash',
    "remarks" TEXT,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashWithdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashWithdrawal_tenantId_referenceNo_key" ON "CashWithdrawal"("tenantId", "referenceNo");

-- CreateIndex
CREATE INDEX "CashWithdrawal_tenantId_outletId_idx" ON "CashWithdrawal"("tenantId", "outletId");

-- CreateIndex
CREATE INDEX "CashWithdrawal_tenantId_shiftSessionId_idx" ON "CashWithdrawal"("tenantId", "shiftSessionId");

-- CreateIndex
CREATE INDEX "CashWithdrawal_tenantId_createdAt_idx" ON "CashWithdrawal"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "CashWithdrawal" ADD CONSTRAINT "CashWithdrawal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashWithdrawal" ADD CONSTRAINT "CashWithdrawal_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashWithdrawal" ADD CONSTRAINT "CashWithdrawal_shiftSessionId_fkey" FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
