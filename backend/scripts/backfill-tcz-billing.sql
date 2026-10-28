-- Backfill TCZ_OPOS / TCZ_POS1 for Line Sales that were saved BEFORE the TCZ
-- dual-write went live (they have a Sale + SaleLine rows but no TCZ rows).
--
-- SAFE TO RE-RUN: only sales that have no TCZ header yet are touched; running it
-- twice inserts nothing the second time. It only READS "Sale"/"SaleLine"/"Customer"
-- and only WRITES the new TCZ tables. TCZ_POS2 is never written (no promotions).
-- Existing sales, payments, stock and held bills are not modified.
--
-- RUN ORDER: apply the TCZ migration -> deploy the new backend -> run this -> run it
-- once more at the end (picks up sales an old backend saved during the switch-over).
--
-- BATCHING: processes the OLDEST not-yet-copied sales first. Set a batch size per
-- session before running (default 1000); repeat until it reports 0 headers inserted:
--     SET tcz.backfill_limit = '500';
--
-- Mapping = the same as backend/src/modules/sale/tczBilling.service.js, using the
-- values already STORED on the sale (nothing recomputed from today's products):
--   header : DocNum=billNo, CreatedBy=cashierName,
--            CreateDate = Sale.createdAt as the exact instant (stored UTC; timestamptz),
--            CreateTime = the IST (Asia/Kolkata, UTC+05:30) wall-clock time of that same instant
--                         (TIME, no zone; same convention as the live writer: tczBilling.service.js
--                         istTimeOfDay). Business date = (CreateDate AT TIME ZONE 'Asia/Kolkata')::date,
--                         so 18:30 UTC is 00:00 IST of the NEXT calendar day,
--            customer fields, HeadDiscTyp/HeaderDiscount=discountType/discountValue,
--            GrandTotal, Cash/Card/UPI/Wallet (only if that was the tender), Paid, Balance
--   lines  : LineId = 1..n in SaleLine.id order (cuid = creation order), Price, Quantity,
--            LineTotal=amount, apportioned TaxableValue/TaxValue
-- Differences from rows written live (by design — the data no longer exists):
--   * InStock is NULL (stock-at-time-of-sale was never recorded; NOT guessed, NOT today's stock)
--   * ClientToken is NULL (no checkout token existed)
--   * line TaxableValue/TaxValue come from the stored 2-dp discount, so they can differ from a
--     live-written row by a fraction of a paisa (<= 0.01 per line)
-- Left NULL exactly as for live rows: header DiscountType, DiscountAmount, TaxableValue,
--   TaxableValueTotal, TotalRevenue, SalesType, Canceled, Hold, DocStatus, Return, Free, Batch,
--   ChangeLog, SlpCode*/SlpName*; line Tax, TaxCode, DiscountName, ReturnBill.
-- Sales with status HELD, or with no lines, are skipped (see the verify script's counts).
-- Text longer than the TCZ column is cut (ItemCode/ItemName/BarCode 255, CustomerName/BPName/BPCode 255,
-- CreatedBy 500) rather than failing the whole batch — the verify script counts how many were affected.
--
-- CONCURRENCY: the first statement takes a transaction-scoped advisory lock, so two
-- backfill runs started at the same time queue up instead of racing: the second one
-- waits for the first to commit, then finds nothing left to copy and inserts 0 rows
-- (without the lock it failed with a duplicate-key error and rolled back). The lock is
-- released automatically at COMMIT/ROLLBACK. It does not block checkouts or any read.
--
-- BILL-NUMBER COLLISIONS: a sale is skipped (never overwritten, never renumbered) when
-- ANOTHER header already uses its (tenant, bill number). It is not resolved silently:
-- run scripts/diagnose-tcz-backfill.sql to list them, and verify-tcz-backfill.sql counts
-- them as PROBLEM rows until a person decides what to do.
--
-- PAYMENT METHOD: matched exactly (cash/card/upi/wallet, lower case) like the live
-- writer. The restored backup held only 'cash' and 'credit', so no lower(btrim()) is
-- applied; a variant spelling would leave the tender columns 0 and the verify script
-- reports it (PROBLEM: sale paymentMethod is not one of the 9 known values).
--
-- RUN IT WITH psql, e.g.:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/backfill-tcz-billing.sql
-- (the script manages its own BEGIN/COMMIT; a GUI client that splits statements is not supported).

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('tcz-backfill'));

-- 1) headers, oldest sale first so DocEntry follows billing order
WITH todo AS (
  SELECT s.*
  FROM "Sale" s
  WHERE s.status = 'COMPLETED'
    AND EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
    AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id)
    AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo")
  ORDER BY s."createdAt", s.id
  LIMIT COALESCE(NULLIF(current_setting('tcz.backfill_limit', true), '')::int, 1000)
), calc AS (
  SELECT s.*,
         round(s."grandTotal", 2)      AS grand,
         round(s."receivedAmount", 2)  AS received
  FROM todo s
)
INSERT INTO "TCZ_OPOS" (
  "TenantId", "OutletId", "SaleId", "ClientToken", "DocNum", "CreateDate", "CreateTime", "CreatedBy", "Object",
  "CustomerMobileNumber", "CustomerName", "BPName", "BPCode", "HeadDiscTyp", "HeaderDiscount", "GrandTotal",
  "Cash", "Card", "UPI", "Wallet", "Paid", "Balance",
  "DiscountType", "DiscountAmount", "TaxableValue", "TaxableValueTotal", "TotalRevenue"
)
SELECT
  s."tenantId", s."outletId", s.id, NULL, s."billNo",
  s."createdAt" AT TIME ZONE 'UTC',
  (s."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::time,   -- IST wall-clock time of the same instant
  LEFT(s."cashierName", 500), 'TCZ_OPOS',
  LEFT(c.mobile, 20), LEFT(s."customerName", 255), LEFT(c.name, 255), LEFT(c.code, 255),
  s."discountType", s."discountValue", s.grand,
  CASE WHEN s."paymentMethod" = 'cash'   THEN LEAST(s.received, s.grand) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'card'   THEN LEAST(s.received, s.grand) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'upi'    THEN LEAST(s.received, s.grand) ELSE 0 END,
  CASE WHEN s."paymentMethod" = 'wallet' THEN LEAST(s.received, s.grand) ELSE 0 END,
  LEAST(s.received, s.grand),
  GREATEST(round(s.grand - s.received, 2), 0),
  NULL, NULL, NULL, NULL, NULL
FROM calc s
LEFT JOIN "Customer" c ON c.id = s."customerId" AND c."tenantId" = s."tenantId"
ORDER BY s."createdAt", s.id;

-- 2) lines for every header that has none yet (i.e. the ones just inserted)
INSERT INTO "TCZ_POS1" (
  "DocEntry", "LineId", "ProductId", "Object", "ItemCode", "ItemName", "BarCode", "Price", "Quantity", "LineTotal",
  "InStock", "TaxableValue", "TaxValue", "Tax", "TaxCode"
)
SELECT
  h."DocEntry",
  row_number() OVER (PARTITION BY l."saleId" ORDER BY l.id),
  l."productId", 'TCZ_OPOS', LEFT(l.code, 255), LEFT(l.name, 255), LEFT(l.code, 255),
  round(l.price, 2), l.qty, round(l.amount, 2),
  NULL,
  round(CASE WHEN s."subTotal" > 0 THEN l.amount / s."subTotal" * GREATEST(s."subTotal" - s."discountAmount", 0) ELSE 0 END, 6),
  round(CASE WHEN s."subTotal" > 0 THEN l.amount / s."subTotal" * GREATEST(s."subTotal" - s."discountAmount", 0) ELSE 0 END * l."taxRate", 6),
  NULL, NULL
FROM "SaleLine" l
JOIN "Sale" s     ON s.id = l."saleId"
JOIN "TCZ_OPOS" h ON h."SaleId" = s.id
WHERE NOT EXISTS (SELECT 1 FROM "TCZ_POS1" p WHERE p."DocEntry" = h."DocEntry");

COMMIT;
