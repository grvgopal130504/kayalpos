-- TCZ becomes the ONLY store for POS sales. "Sale" and "SaleLine" are removed and every
-- table that pointed at them now points at TCZ_OPOS / TCZ_POS1.
--
-- TAKE A DATABASE BACKUP BEFORE APPLYING (the drop at the end is permanent).
--
-- Prisma runs this file as a single transaction. Before anything is dropped it copies every
-- Sale / SaleLine that is not in TCZ yet, fills the new columns for ALL bills, re-points
-- SalesReturn / SalesReturnItem / HeldBill, and then ABORTS (rolling everything back) if
-- any row could not be mapped.

-- ---------------------------------------------------------------------------
-- 1) New columns
-- ---------------------------------------------------------------------------
ALTER TABLE "TCZ_OPOS"
  ADD COLUMN "CustomerId"   TEXT,
  ADD COLUMN "SubTotal"     DECIMAL(19,6) DEFAULT 0,
  ADD COLUMN "TaxAmount"    DECIMAL(19,6) DEFAULT 0,
  ADD COLUMN "Received"     DECIMAL(19,6) DEFAULT 0,
  ADD COLUMN "ChangeAmount" DECIMAL(19,6) DEFAULT 0,
  ADD COLUMN "PayMode"      VARCHAR(30),
  ADD COLUMN "CardType"     VARCHAR(50),
  ADD COLUMN "CardLast4"    VARCHAR(4),
  ADD COLUMN "CardBank"     VARCHAR(100),
  ADD COLUMN "UpiApp"       VARCHAR(50),
  ADD COLUMN "UpiTxnId"     VARCHAR(100),
  ADD COLUMN "PayRef"       VARCHAR(120);

ALTER TABLE "TCZ_POS1"
  ADD COLUMN "Uom"     VARCHAR(50),
  ADD COLUMN "TaxRate" DECIMAL(5,4);

ALTER TABLE "HeldBill"        ADD COLUMN "tczDocEntry" BIGINT;
ALTER TABLE "SalesReturn"     ADD COLUMN "docEntry"    BIGINT;
ALTER TABLE "SalesReturnItem" ADD COLUMN "docEntry" BIGINT, ADD COLUMN "lineId" INTEGER;

-- ---------------------------------------------------------------------------
-- 2) Copy bills that never reached TCZ (older than the dual-write, or skipped by the
--    old backfill). Oldest first so DocEntry follows billing order. Same mapping as
--    backend/scripts/backfill-tcz-billing.sql; the extra columns are filled in step 3.
-- ---------------------------------------------------------------------------
INSERT INTO "TCZ_OPOS" (
  "TenantId", "OutletId", "SaleId", "ClientToken", "DocNum", "CreateDate", "CreateTime", "CreatedBy", "Object",
  "CustomerMobileNumber", "CustomerName", "BPName", "BPCode", "HeadDiscTyp", "HeaderDiscount", "GrandTotal",
  "Cash", "Card", "UPI", "Wallet", "Paid", "Balance"
)
SELECT
  s."tenantId", s."outletId", s.id, NULL, s."billNo",
  s."createdAt" AT TIME ZONE 'UTC',
  (s."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::time,
  LEFT(s."cashierName", 500), 'TCZ_OPOS',
  LEFT(c.mobile, 20), LEFT(s."customerName", 255), LEFT(c.name, 255), LEFT(c.code, 255),
  s."discountType", s."discountValue", round(s."grandTotal", 2),
  CASE WHEN s."paymentMethod" = 'cash'   THEN LEAST(round(s."receivedAmount", 2), round(s."grandTotal", 2)) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'card'   THEN LEAST(round(s."receivedAmount", 2), round(s."grandTotal", 2)) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'upi'    THEN LEAST(round(s."receivedAmount", 2), round(s."grandTotal", 2)) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'wallet' THEN LEAST(round(s."receivedAmount", 2), round(s."grandTotal", 2)) ELSE 0 END,
  LEAST(round(s."receivedAmount", 2), round(s."grandTotal", 2)),
  GREATEST(round(s."grandTotal" - s."receivedAmount", 2), 0)
FROM "Sale" s
LEFT JOIN "Customer" c ON c.id = s."customerId" AND c."tenantId" = s."tenantId"
WHERE NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id)
  AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo")
ORDER BY s."createdAt", s.id;

-- ---------------------------------------------------------------------------
-- 3) Fill the new / previously-empty header columns for EVERY bill
-- ---------------------------------------------------------------------------
UPDATE "TCZ_OPOS" h SET
  "CustomerId"        = s."customerId",
  "SubTotal"          = round(s."subTotal", 2),
  "TaxAmount"         = round(s."taxAmount", 2),
  "Received"          = round(s."receivedAmount", 2),
  "ChangeAmount"      = round(s."changeAmount", 2),
  "PayMode"           = s."paymentMethod",
  "CardType"          = LEFT(s."cardType", 50),
  "CardLast4"         = LEFT(s."cardLast4", 4),
  "CardBank"          = LEFT(s."cardBank", 100),
  "UpiApp"            = LEFT(s."upiApp", 50),
  "UpiTxnId"          = LEFT(s."upiTxnId", 100),
  "PayRef"            = LEFT(s."paymentReference", 120),
  "DiscountAmount"    = round(s."discountAmount", 2),
  "TaxableValue"      = round(GREATEST(s."subTotal" - s."discountAmount", 0), 2),
  "TaxableValueTotal" = round(GREATEST(s."subTotal" - s."discountAmount", 0), 2),
  "DocStatus"         = s.status::text,
  "Canceled"          = 'N',
  "Hold"              = CASE WHEN s.status::text = 'HELD' THEN 'Y' ELSE 'N' END
FROM "Sale" s
WHERE h."SaleId" = s.id;

-- ---------------------------------------------------------------------------
-- 4) Lines: copy the missing ones, then fill Uom / TaxRate / Tax on all of them.
--    LineId = position by SaleLine.id (same rule the old backfill used).
-- ---------------------------------------------------------------------------
INSERT INTO "TCZ_POS1" (
  "DocEntry", "LineId", "ProductId", "Object", "ItemCode", "ItemName", "BarCode", "Price", "Quantity", "LineTotal",
  "InStock", "TaxableValue", "TaxValue"
)
SELECT
  h."DocEntry",
  row_number() OVER (PARTITION BY l."saleId" ORDER BY l.id),
  l."productId", 'TCZ_OPOS', LEFT(l.code, 255), LEFT(l.name, 255), LEFT(l.code, 255),
  round(l.price, 2), l.qty, round(l.amount, 2), NULL,
  round(CASE WHEN s."subTotal" > 0 THEN l.amount / s."subTotal" * GREATEST(s."subTotal" - s."discountAmount", 0) ELSE 0 END, 6),
  round(CASE WHEN s."subTotal" > 0 THEN l.amount / s."subTotal" * GREATEST(s."subTotal" - s."discountAmount", 0) ELSE 0 END * l."taxRate", 6)
FROM "SaleLine" l
JOIN "Sale" s     ON s.id = l."saleId"
JOIN "TCZ_OPOS" h ON h."SaleId" = s.id
WHERE NOT EXISTS (SELECT 1 FROM "TCZ_POS1" p WHERE p."DocEntry" = h."DocEntry");

CREATE TEMP TABLE _line_map AS
SELECT l.id AS sale_line_id, h."DocEntry" AS doc_entry,
       row_number() OVER (PARTITION BY l."saleId" ORDER BY l.id)::int AS line_id,
       l."productId" AS product_id, l.uom, l."taxRate"
FROM "SaleLine" l
JOIN "TCZ_OPOS" h ON h."SaleId" = l."saleId";

UPDATE "TCZ_POS1" p SET
  "Uom"     = LEFT(m.uom, 50),
  "TaxRate" = m."taxRate",
  "Tax"     = m."taxRate" * 100          -- percent, e.g. 5.0000 for 5%
FROM _line_map m
WHERE p."DocEntry" = m.doc_entry AND p."LineId" = m.line_id AND p."ProductId" = m.product_id;

-- ---------------------------------------------------------------------------
-- 5) Re-point SalesReturn / SalesReturnItem / HeldBill at the TCZ rows
-- ---------------------------------------------------------------------------
UPDATE "SalesReturn" r SET "docEntry" = h."DocEntry"
FROM "TCZ_OPOS" h WHERE h."SaleId" = r."saleId";

UPDATE "SalesReturnItem" i SET "docEntry" = m.doc_entry, "lineId" = m.line_id
FROM _line_map m WHERE m.sale_line_id = i."saleLineId";

UPDATE "HeldBill" b SET "tczDocEntry" = h."DocEntry"
FROM "TCZ_OPOS" h WHERE h."SaleId" = b."saleId";

-- ---------------------------------------------------------------------------
-- 6) Safety checks — abort (and roll everything back) if anything was left behind
-- ---------------------------------------------------------------------------
DO $$
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM "Sale" s WHERE NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id);
  IF n > 0 THEN RAISE EXCEPTION '% Sale row(s) have no TCZ_OPOS row (bill-number collision?). List them with: SELECT s.id, s."billNo" FROM "Sale" s WHERE NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id); fix the numbering, then retry.', n; END IF;

  SELECT count(*) INTO n FROM "SaleLine" l
    WHERE NOT EXISTS (SELECT 1 FROM _line_map m JOIN "TCZ_POS1" p ON p."DocEntry" = m.doc_entry AND p."LineId" = m.line_id AND p."ProductId" = m.product_id WHERE m.sale_line_id = l.id);
  IF n > 0 THEN RAISE EXCEPTION '% SaleLine row(s) could not be matched to a TCZ_POS1 line.', n; END IF;

  SELECT count(*) INTO n FROM "SalesReturn"     WHERE "docEntry" IS NULL;
  IF n > 0 THEN RAISE EXCEPTION '% SalesReturn row(s) could not be mapped to a TCZ bill.', n; END IF;
  SELECT count(*) INTO n FROM "SalesReturnItem" WHERE "docEntry" IS NULL OR "lineId" IS NULL;
  IF n > 0 THEN RAISE EXCEPTION '% SalesReturnItem row(s) could not be mapped to a TCZ line.', n; END IF;
  SELECT count(*) INTO n FROM "HeldBill" WHERE "saleId" IS NOT NULL AND "tczDocEntry" IS NULL;
  IF n > 0 THEN RAISE EXCEPTION '% HeldBill row(s) could not be mapped to a TCZ bill.', n; END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 7) Swap the relations, drop the old tables
-- ---------------------------------------------------------------------------
ALTER TABLE "SalesReturn" DROP COLUMN "saleId";               -- also drops its FK + index
ALTER TABLE "SalesReturn" ALTER COLUMN "docEntry" SET NOT NULL;
CREATE INDEX "SalesReturn_tenantId_docEntry_idx" ON "SalesReturn"("tenantId", "docEntry");
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_docEntry_fkey"
  FOREIGN KEY ("docEntry") REFERENCES "TCZ_OPOS"("DocEntry") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SalesReturnItem" DROP COLUMN "saleLineId";
ALTER TABLE "SalesReturnItem" ALTER COLUMN "docEntry" SET NOT NULL, ALTER COLUMN "lineId" SET NOT NULL;
CREATE INDEX "SalesReturnItem_docEntry_lineId_idx" ON "SalesReturnItem"("docEntry", "lineId");
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_docEntry_lineId_fkey"
  FOREIGN KEY ("docEntry", "lineId") REFERENCES "TCZ_POS1"("DocEntry", "LineId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HeldBill" DROP COLUMN "saleId";
CREATE UNIQUE INDEX "HeldBill_tczDocEntry_key" ON "HeldBill"("tczDocEntry");
ALTER TABLE "HeldBill" ADD CONSTRAINT "HeldBill_tczDocEntry_fkey"
  FOREIGN KEY ("tczDocEntry") REFERENCES "TCZ_OPOS"("DocEntry") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TCZ_OPOS" DROP COLUMN "SaleId";                  -- also drops its FK + unique index

CREATE INDEX "TCZ_OPOS_TenantId_CustomerId_idx"          ON "TCZ_OPOS"("TenantId", "CustomerId");
CREATE INDEX "TCZ_OPOS_TenantId_OutletId_CreateDate_idx" ON "TCZ_OPOS"("TenantId", "OutletId", "CreateDate");
CREATE INDEX "TCZ_OPOS_TenantId_PayMode_CreateDate_idx"  ON "TCZ_OPOS"("TenantId", "PayMode", "CreateDate");
ALTER TABLE "TCZ_OPOS" ADD CONSTRAINT "TCZ_OPOS_CustomerId_fkey"
  FOREIGN KEY ("CustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "SaleLine";
DROP TABLE "Sale";
DROP TYPE "SaleStatus";
DROP TABLE _line_map;
