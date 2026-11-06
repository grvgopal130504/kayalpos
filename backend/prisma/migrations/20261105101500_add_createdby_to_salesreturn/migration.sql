-- SalesReturn was the one transaction header missing CreatedBy entirely
-- (every other document header already had it). Nullable since it is
-- being added to a table that may already have rows.

ALTER TABLE "SalesReturn" ADD COLUMN "CreatedBy" TEXT;
