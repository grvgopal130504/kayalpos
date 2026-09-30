-- Shift Closing: new reconciliation columns on ShiftSession, plus a
-- dedicated table for the closing-cash denomination count (kept separate
-- from ShiftOpeningDenomination so an opening count and a closing count of
-- the same shift never collide).

ALTER TABLE "ShiftSession"
  ADD COLUMN "expectedClosingCash" DECIMAL(12,2),
  ADD COLUMN "closingVariance" DECIMAL(12,2),
  ADD COLUMN "closingTotalSales" DECIMAL(12,2),
  ADD COLUMN "closingRemarks" TEXT;

CREATE TABLE "ShiftClosingDenomination" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "unitValue" DECIMAL(12,2),
  "pieces" INTEGER NOT NULL DEFAULT 0,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,

  CONSTRAINT "ShiftClosingDenomination_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShiftClosingDenomination_shiftId_idx" ON "ShiftClosingDenomination"("shiftId");

ALTER TABLE "ShiftClosingDenomination"
  ADD CONSTRAINT "ShiftClosingDenomination_shiftId_fkey"
  FOREIGN KEY ("shiftId") REFERENCES "ShiftSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
