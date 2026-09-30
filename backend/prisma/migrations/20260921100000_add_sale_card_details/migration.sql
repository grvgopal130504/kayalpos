-- Adds optional card-network detail to Sale, populated only when a sale is
-- made with paymentMethod = 'card'. Nullable so every existing row (and any
-- non-card sale) is unaffected.
ALTER TABLE "Sale" ADD COLUMN "cardType" TEXT;
ALTER TABLE "Sale" ADD COLUMN "cardLast4" TEXT;
ALTER TABLE "Sale" ADD COLUMN "cardBank" TEXT;
