-- Adds a reorder threshold to Product, powering the Home dashboard's real
-- "Low Stock Items" panel (availableQty <= reorderLevel). Defaults every
-- existing row to 10 so the column is non-breaking with no backfill needed.
ALTER TABLE "Product" ADD COLUMN "reorderLevel" INTEGER NOT NULL DEFAULT 10;
