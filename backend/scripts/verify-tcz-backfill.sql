-- READ-ONLY reconciliation for the TCZ billing tables (v2). Changes nothing.
-- Run it before and after the backfill. Every row whose name starts with
-- "PROBLEM:" must be 0 after the last backfill run. "INFO:" and "TENANT" rows are
-- context only. Output: two columns, "check" and "n".
--
--   psql "$DATABASE_URL" -X -At -F '|' -f scripts/verify-tcz-backfill.sql
--
-- All comparisons are NULL-safe (IS DISTINCT FROM): a NULL where a value is
-- expected counts as a mismatch instead of silently passing.
--
-- What it proves, per header joined to its Sale (SaleId):
--   missing / orphan / duplicate headers, bill-number collisions, wrong tenant,
--   DocNum, outlet, CreateDate (exact instant) / CreateTime (IST time of day), totals (GrandTotal, Paid, Balance,
--   sum of line totals), line count, LineId 1..n without gaps, quantities, the
--   exact multiset of products, and the tender columns versus Sale.paymentMethod;
--   plus the unique indexes that make duplicates impossible are still present.
-- What it cannot prove: that fields left NULL on purpose (see the backfill header)
-- have a business meaning, or that InStock is right (it is NULL for backfilled bills).

WITH
sl AS (  -- Sale side, one row per sale
  SELECT l."saleId",
         count(*)                               AS cnt,
         sum(l.qty)                             AS qty,
         sum(round(l.amount, 2))                AS total,
         array_agg(l."productId" ORDER BY l."productId") AS prods,
         array_agg(l."productId" || '|' || l.qty::text || '|' || trim_scale(round(l.amount, 2))::text
                   ORDER BY l."productId" || '|' || l.qty::text || '|' || trim_scale(round(l.amount, 2))::text) AS combo
  FROM "SaleLine" l GROUP BY l."saleId"
),
hl AS (  -- TCZ side, one row per header
  SELECT p."DocEntry",
         count(*)                               AS cnt,
         min(p."LineId")                        AS mn,
         max(p."LineId")                        AS mx,
         sum(p."Quantity")                      AS qty,
         sum(p."LineTotal")                     AS total,
         array_agg(p."ProductId" ORDER BY p."ProductId") AS prods,
         array_agg(p."ProductId" || '|' || trim_scale(p."Quantity")::text || '|' || trim_scale(p."LineTotal")::text
                   ORDER BY p."ProductId" || '|' || trim_scale(p."Quantity")::text || '|' || trim_scale(p."LineTotal")::text) AS combo
  FROM "TCZ_POS1" p GROUP BY p."DocEntry"
),
hb AS (  -- header + its sale + both aggregates
  SELECT h.*, s.id AS sid, s."tenantId" AS s_tenant, s."billNo" AS s_bill, s."outletId" AS s_outlet,
         s."createdAt" AS s_created, s.status AS s_status, s."paymentMethod" AS s_pm,
         round(s."grandTotal", 2) AS s_grand, round(s."receivedAmount", 2) AS s_recv, s."subTotal" AS s_sub,
         hl.cnt AS h_cnt, hl.mn, hl.mx, hl.qty AS h_qty, hl.total AS h_total, hl.prods AS h_prods, hl.combo AS h_combo,
         sl.cnt AS s_cnt, sl.qty AS s_qty, sl.total AS s_total, sl.prods AS s_prods, sl.combo AS s_combo
  FROM "TCZ_OPOS" h
  LEFT JOIN "Sale" s ON s.id = h."SaleId"
  LEFT JOIN hl ON hl."DocEntry" = h."DocEntry"
  LEFT JOIN sl ON sl."saleId" = s.id
),
need AS (  -- completed sales that should have a header
  SELECT s.* FROM "Sale" s
  WHERE s.status = 'COMPLETED' AND EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
)
SELECT "check", n FROM (
  SELECT 10 AS ord, 'sales (COMPLETED) total' AS "check", count(*) AS n FROM "Sale" WHERE status = 'COMPLETED'
  UNION ALL SELECT 11, 'sales skipped by design: status HELD', count(*) FROM "Sale" WHERE status <> 'COMPLETED'
  UNION ALL SELECT 12, 'sales skipped by design: no lines', count(*) FROM "Sale" s WHERE status = 'COMPLETED' AND NOT EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id)
  UNION ALL SELECT 13, 'TCZ headers', count(*) FROM "TCZ_OPOS"

  -- ---- presence / duplicates / orphans ------------------------------------
  UNION ALL SELECT 20, 'PROBLEM: completed sales with lines but NO TCZ header', count(*) FROM need n
    WHERE NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = n.id)
  UNION ALL SELECT 21, 'PROBLEM: ...of those, skipped because the bill number is already used by ANOTHER header (collision; see diagnose script)', count(*) FROM need n
    WHERE NOT EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."SaleId" = n.id)
      AND EXISTS (SELECT 1 FROM "TCZ_OPOS" t WHERE t."TenantId" = n."tenantId" AND t."DocNum" = n."billNo")
  UNION ALL SELECT 22, 'PROBLEM: orphan headers (SaleId is NULL)', count(*) FROM "TCZ_OPOS" WHERE "SaleId" IS NULL
  UNION ALL SELECT 23, 'PROBLEM: SaleId used by more than one header', count(*) FROM (SELECT 1 FROM "TCZ_OPOS" WHERE "SaleId" IS NOT NULL GROUP BY "SaleId" HAVING count(*) > 1) d
  UNION ALL SELECT 24, 'PROBLEM: (tenant, bill number) used by more than one header', count(*) FROM (SELECT 1 FROM "TCZ_OPOS" WHERE "DocNum" IS NOT NULL GROUP BY "TenantId", "DocNum" HAVING count(*) > 1) d
  UNION ALL SELECT 25, 'PROBLEM: header whose sale is not COMPLETED', count(*) FROM hb WHERE sid IS NOT NULL AND s_status IS DISTINCT FROM 'COMPLETED'
  UNION ALL SELECT 26, 'PROBLEM: required unique/primary indexes missing', count(*) FROM (VALUES
      ('TCZ_OPOS', 'TCZ_OPOS_pkey'), ('TCZ_OPOS', 'TCZ_OPOS_SaleId_key'), ('TCZ_OPOS', 'TCZ_OPOS_TenantId_DocNum_key'),
      ('TCZ_OPOS', 'TCZ_OPOS_TenantId_ClientToken_key'), ('TCZ_POS1', 'TCZ_POS1_pkey')) v(t, i)
    WHERE NOT EXISTS (SELECT 1 FROM pg_indexes x WHERE x.schemaname = current_schema() AND x.tablename = v.t AND x.indexname = v.i AND x.indexdef LIKE 'CREATE UNIQUE INDEX%')

  -- ---- header fields vs the Sale ------------------------------------------
  UNION ALL SELECT 30, 'PROBLEM: header tenant differs from its sale', count(*) FROM hb WHERE sid IS NOT NULL AND "TenantId" IS DISTINCT FROM s_tenant
  UNION ALL SELECT 31, 'PROBLEM: DocNum differs from Sale.billNo', count(*) FROM hb WHERE sid IS NOT NULL AND "DocNum" IS DISTINCT FROM s_bill
  UNION ALL SELECT 32, 'PROBLEM: header outlet differs from its sale', count(*) FROM hb WHERE sid IS NOT NULL AND "OutletId" IS DISTINCT FROM s_outlet
  -- live rows stamp CreateDate a few ms after the sale insert; 60 s absorbs that, a timezone slip (hours) does not
  UNION ALL SELECT 33, 'PROBLEM: CreateDate missing or more than 60 s away from Sale.createdAt', count(*) FROM hb
    WHERE sid IS NOT NULL AND ("CreateDate" IS NULL OR abs(extract(epoch FROM ("CreateDate" - (s_created AT TIME ZONE 'UTC')))) > 60)
  -- CreateTime is the IST (Asia/Kolkata) wall-clock time of the SAME instant as CreateDate (exact match, to the
  -- microsecond). A value left in UTC is 5h30 off and fails here. The zone is named explicitly, so the result does not
  -- depend on the session's TimeZone setting.
  UNION ALL SELECT 34, 'PROBLEM: CreateTime missing or not the IST (Asia/Kolkata) time of day of CreateDate', count(*) FROM hb
    WHERE sid IS NOT NULL AND ("CreateDate" IS NULL OR "CreateTime" IS DISTINCT FROM ("CreateDate" AT TIME ZONE 'Asia/Kolkata')::time)
  UNION ALL SELECT 35, 'PROBLEM: GrandTotal differs from Sale', count(*) FROM hb WHERE sid IS NOT NULL AND "GrandTotal" IS DISTINCT FROM s_grand
  UNION ALL SELECT 36, 'PROBLEM: Paid <> min(received, grand)', count(*) FROM hb WHERE sid IS NOT NULL AND "Paid" IS DISTINCT FROM LEAST(s_recv, s_grand)
  UNION ALL SELECT 37, 'PROBLEM: Balance <> max(grand - received, 0)', count(*) FROM hb WHERE sid IS NOT NULL AND "Balance" IS DISTINCT FROM GREATEST(round(s_grand - s_recv, 2), 0)

  -- ---- payment / tender ----------------------------------------------------
  UNION ALL SELECT 40, 'PROBLEM: tender columns (Cash/Card/UPI/Wallet) differ from Sale.paymentMethod', count(*) FROM hb
    WHERE sid IS NOT NULL AND (
         "Cash"   IS DISTINCT FROM (CASE WHEN s_pm = 'cash'   THEN LEAST(s_recv, s_grand) ELSE 0 END)
      OR "Card"   IS DISTINCT FROM (CASE WHEN s_pm = 'card'   THEN LEAST(s_recv, s_grand) ELSE 0 END)
      OR "UPI"    IS DISTINCT FROM (CASE WHEN s_pm = 'upi'    THEN LEAST(s_recv, s_grand) ELSE 0 END)
      OR "Wallet" IS DISTINCT FROM (CASE WHEN s_pm = 'wallet' THEN LEAST(s_recv, s_grand) ELSE 0 END))
  UNION ALL SELECT 41, 'PROBLEM: sale paymentMethod is not one of the 9 known values (spelling/case variant -> tender columns would be 0)', count(*) FROM need
    WHERE "paymentMethod" NOT IN ('cash', 'upi', 'card', 'wallet', 'credit', 'store-credit', 'gift-card', 'cheque', 'bank-transfer')

  -- ---- lines ---------------------------------------------------------------
  UNION ALL SELECT 50, 'PROBLEM: TCZ header with no lines', count(*) FROM "TCZ_OPOS" h WHERE NOT EXISTS (SELECT 1 FROM "TCZ_POS1" p WHERE p."DocEntry" = h."DocEntry")
  UNION ALL SELECT 51, 'PROBLEM: line count differs from SaleLine count', count(*) FROM hb WHERE sid IS NOT NULL AND COALESCE(h_cnt, 0) IS DISTINCT FROM COALESCE(s_cnt, 0)
  UNION ALL SELECT 52, 'PROBLEM: LineId is not 1..n without gaps', count(*) FROM hb WHERE h_cnt IS NOT NULL AND (mn IS DISTINCT FROM 1 OR mx IS DISTINCT FROM h_cnt)
  UNION ALL SELECT 53, 'PROBLEM: sum(LineTotal) differs from Sale.subTotal', count(*) FROM hb WHERE sid IS NOT NULL AND h_total IS DISTINCT FROM s_sub
  UNION ALL SELECT 54, 'PROBLEM: sum(Quantity) differs from sum(SaleLine.qty)', count(*) FROM hb WHERE sid IS NOT NULL AND h_qty IS DISTINCT FROM s_qty::numeric
  UNION ALL SELECT 55, 'PROBLEM: set of ProductIds differs from the sale', count(*) FROM hb WHERE sid IS NOT NULL AND h_prods IS DISTINCT FROM s_prods
  UNION ALL SELECT 56, 'PROBLEM: some line differs from the sale line (product + quantity + line total)', count(*) FROM hb WHERE sid IS NOT NULL AND h_combo IS DISTINCT FROM s_combo

  -- ---- context only --------------------------------------------------------
  UNION ALL SELECT 60, 'INFO: sales paid by a tender with no TCZ column (credit/store-credit/gift-card/cheque/bank-transfer) - by design', count(*) FROM need
    WHERE "paymentMethod" IN ('credit', 'store-credit', 'gift-card', 'cheque', 'bank-transfer')
  UNION ALL SELECT 61, 'INFO: sales whose text was cut to fit a TCZ column', count(*) FROM "Sale" s
    WHERE s.status = 'COMPLETED' AND (length(s."customerName") > 255 OR length(s."cashierName") > 500
       OR EXISTS (SELECT 1 FROM "SaleLine" l WHERE l."saleId" = s.id AND (length(l.name) > 255 OR length(l.code) > 255)))
  UNION ALL SELECT 62, 'INFO: TCZ_POS2 rows (expected 0)', count(*) FROM "TCZ_POS2"
  UNION ALL SELECT 63, 'INFO: headers whose Object is not TCZ_OPOS', count(*) FROM "TCZ_OPOS" WHERE "Object" IS DISTINCT FROM 'TCZ_OPOS'
  -- Prisma (adapter-pg) writes a timestamptz instant as a zone-less string, so a writer's SESSION TimeZone must be UTC for
  -- CreateDate to be exact. The application pins its own pooled sessions to UTC (src/config/prisma.js); only unpinned writers
  -- (psql, scripts, other clients) are affected, and check 33 above catches any shifted row. n = THIS session's UTC offset in seconds.
  UNION ALL SELECT 65, 'INFO: database TimeZone = ' || current_setting('TimeZone') || ' (n = UTC offset in seconds of this session; informational, the app pins UTC)', extract(timezone FROM now())::bigint
  UNION ALL SELECT 64, 'INFO: lines with InStock NULL (expected for backfilled bills)', count(*) FROM "TCZ_POS1" WHERE "InStock" IS NULL

  -- ---- tenant level --------------------------------------------------------
  UNION ALL SELECT 70, 'PROBLEM: tenants whose TCZ header count differs from their completed sales with lines', count(*) FROM "Tenant" t
    WHERE (SELECT count(*) FROM need n WHERE n."tenantId" = t.id) IS DISTINCT FROM (SELECT count(*) FROM "TCZ_OPOS" h WHERE h."TenantId" = t.id)
  UNION ALL SELECT 80, 'TENANT ' || t.slug || ': completed sales with lines', (SELECT count(*) FROM need n WHERE n."tenantId" = t.id) FROM "Tenant" t
  UNION ALL SELECT 81, 'TENANT ' || t.slug || ': TCZ headers', (SELECT count(*) FROM "TCZ_OPOS" h WHERE h."TenantId" = t.id) FROM "Tenant" t
  UNION ALL SELECT 82, 'TENANT ' || t.slug || ': TCZ lines', (SELECT count(*) FROM "TCZ_POS1" p JOIN "TCZ_OPOS" h USING ("DocEntry") WHERE h."TenantId" = t.id) FROM "Tenant" t
) r ORDER BY ord, "check";
