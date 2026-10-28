-- READ-ONLY diagnostics to run BEFORE the backfill (and whenever verify reports a
-- PROBLEM). Changes nothing. It prints four result sets:
--
--   0. TIMEZONE     this session's TimeZone (the app pins UTC itself; informational)
--   1. DRY RUN      what the next backfill run would copy / skip, and why
--   2. COLLISIONS   completed sales the backfill will keep skipping because another
--                   TCZ header already uses their (tenant, bill number)
--   3. PAYMENT      every distinct Sale.paymentMethod with its count and how TCZ
--                   treats it (spelling/case variants show as UNRECOGNISED)
--
--   psql "$DATABASE_URL" -X -f scripts/diagnose-tcz-backfill.sql
--
-- Collisions are NEVER resolved automatically (no renumbering, no overwriting, no
-- change to any Sale). Typical causes: a header imported from the SQL Server system
-- with the same document number, or a header whose Sale was deleted (SaleId NULL).
-- Decide per row: keep the existing header (then link it to the right sale yourself),
-- or move it aside; only then re-run the backfill.

\echo '== 0. TIME ZONE of THIS session (the app pins its own pooled sessions to UTC, so its CreateDate values are exact whatever this says)'
SELECT current_setting('TimeZone') AS session_timezone, extract(timezone FROM now())::int AS utc_offset_seconds,
       CASE WHEN extract(timezone FROM now()) = 0 THEN 'ok (this session is UTC)' ELSE 'info: this session is not UTC; the app is unaffected (it pins UTC), but any OTHER unpinned writer (psql, scripts, another client) would store a timestamptz shifted by this offset' END AS note;

\echo '== 1. DRY RUN: what the next backfill run would do'
SELECT 'would copy (completed, has lines, no header, no bill-number clash)' AS what, count(*) AS sales
FROM "Sale" s
WHERE s.status = 'COMPLETED'
  AND EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
  AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id)
  AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo")
UNION ALL
SELECT 'already have a header', count(*) FROM "Sale" s WHERE EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id)
UNION ALL
SELECT 'skipped: status HELD', count(*) FROM "Sale" WHERE status <> 'COMPLETED'
UNION ALL
SELECT 'skipped: no lines', count(*) FROM "Sale" s WHERE status = 'COMPLETED' AND NOT EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
UNION ALL
SELECT 'skipped: bill-number collision (see list below)', count(*) FROM "Sale" s
WHERE s.status = 'COMPLETED'
  AND EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
  AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = s.id)
  AND EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo");

\echo '== 2. COLLISIONS: sales that cannot be copied because the bill number is already taken'
SELECT te.slug AS tenant, s.id AS sale_id, s."billNo" AS bill_no, s."createdAt" AS sale_created,
       s."grandTotal" AS sale_grand_total,
       t."DocEntry" AS blocking_doc_entry, t."SaleId" AS blocking_sale_id,
       CASE WHEN t."SaleId" IS NULL THEN 'orphan header (no sale linked)'
            ELSE 'header belongs to a different sale' END AS reason,
       t."GrandTotal" AS blocking_grand_total, t."CreateDate" AS blocking_created
FROM "Sale" s
JOIN "Tenant" te ON te.id = s."tenantId"
JOIN "TCZ_OPOS" t ON t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo"
WHERE s.status = 'COMPLETED'
  AND EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
  AND NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" x WHERE x."SaleId" = s.id)
ORDER BY te.slug, s."createdAt", s.id;

\echo '== 3. PAYMENT METHODS actually stored on completed sales'
SELECT '[' || "paymentMethod" || ']' AS payment_method_as_stored, count(*) AS sales,
       CASE WHEN "paymentMethod" IN ('cash', 'card', 'upi', 'wallet') THEN 'mapped to its own TCZ tender column'
            WHEN "paymentMethod" IN ('credit', 'store-credit', 'gift-card', 'cheque', 'bank-transfer') THEN 'no TCZ column (by design): tender columns 0, Paid/Balance filled'
            ELSE 'UNRECOGNISED (case/space variant?) - tender columns would be 0; decide before backfilling' END AS tcz_treatment
FROM "Sale" WHERE status = 'COMPLETED'
GROUP BY "paymentMethod" ORDER BY count(*) DESC, 1;
