-- Adds optional UPI detail to Sale, populated only when a sale is made
-- with paymentMethod = 'upi'. Nullable so every existing row (and any
-- non-UPI sale) is unaffected.
ALTER TABLE "Sale" ADD COLUMN "upiApp" TEXT;
ALTER TABLE "Sale" ADD COLUMN "upiTxnId" TEXT;
