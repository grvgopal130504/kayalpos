-- Shift Session module: the cashier's cash-drawer shift opening. Only one
-- shift may be OPEN per outlet at a time — enforced in the application
-- (shiftSession.service.js), with the unique [tenantId, outletId, shiftNo]
-- index below as a second, database-level guard against a race between two
-- concurrent submissions landing on the same shift number. openingCash is
-- always server-computed from the submitted denomination counts, never
-- trusted from the client as a bare total (same rule StockCount's totals
-- follow). closedAt/closingCash stay null until a (separate, not-yet-built)
-- Shift Closing screen closes the row out.

CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE "ShiftSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "shiftNo" TEXT NOT NULL,
    "shiftName" TEXT,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "description" TEXT,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "openingCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "previousClosingCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "attachmentName" TEXT,
    "agreedTerms" BOOLEAN NOT NULL DEFAULT false,
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "closingCash" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShiftOpeningDenomination" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unitValue" DECIMAL(12,2),
    "pieces" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "ShiftOpeningDenomination_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShiftSession_tenantId_outletId_shiftNo_key" ON "ShiftSession"("tenantId", "outletId", "shiftNo");
CREATE INDEX "ShiftSession_tenantId_outletId_status_idx" ON "ShiftSession"("tenantId", "outletId", "status");
CREATE INDEX "ShiftSession_tenantId_cashierId_idx" ON "ShiftSession"("tenantId", "cashierId");

CREATE INDEX "ShiftOpeningDenomination_shiftId_idx" ON "ShiftOpeningDenomination"("shiftId");

ALTER TABLE "ShiftSession" ADD CONSTRAINT "ShiftSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShiftSession" ADD CONSTRAINT "ShiftSession_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShiftOpeningDenomination" ADD CONSTRAINT "ShiftOpeningDenomination_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
