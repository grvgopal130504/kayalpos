-- ============================================================================================
-- READ-ONLY pre-migration checks for the Kayal POS database on Azure PostgreSQL  (reviewed v2)
-- ============================================================================================
-- Changes NOTHING. It contains no INSERT / UPDATE / DELETE / CREATE / ALTER / DROP / TRUNCATE / GRANT / COPY / DO,
-- no migration and no backfill. Safety layers:
--   1. SET default_transaction_read_only = on      (this session cannot write, even outside the transaction below)
--   2. BEGIN READ ONLY ... ROLLBACK                (the server rejects any write; nothing is ever committed)
--   3. SET LOCAL lock_timeout = '3s'               (only ACCESS SHARE locks are taken, which block nothing; if someone
--      is running DDL right now, this check gives up after 3 s instead of queueing behind it and blocking others)
--   4. SET LOCAL statement_timeout = '120s'        (no runaway query on a big table)
-- Needs the psql program (it uses \ commands: \echo \set \gset \if). It will NOT run in pgAdmin / DBeaver query windows.
-- Needs psql 10 or newer; server PostgreSQL 12 or newer (Azure Flexible Server 12-17 all fine).
-- The output contains NO host name, user name, database name or password (role/database names are replaced by labels).
-- Start with the SUMMARY at the very end (PASS / WARNING / FAIL per check), then the detail sections above it.

\set ON_ERROR_ROLLBACK on
\set VERBOSITY terse
\pset pager off
\pset null '(null)'

-- Default every result to -1 = "this query did not run or failed" (shows as UNKNOWN in the summary).
\set srv_num -1
\set utc_off -1
\set has_hist 0
\set n_hist_bad -1
\set n_pending -1
\set n_differs -1
\set n_notinrepo -1
\set n_pend_destr -1
\set n_pend_caution -1
\set n_drift -1
\set has_tcz -1
\set n_tcz_headers -1
\set n_shifted -1
\set n_ct_bad -1
\set n_collisions -1
\set has_uom_base 0
\set n_uom_conflict -1
\set n_parent_noref -1
\set can_create_public -1
\set can_write_hist -1
\set n_notowner -1
\set sees_all -1
\set n_long_tx -1
\set n_lock_waits -1

SET default_transaction_read_only = on;
BEGIN READ ONLY;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '120s';
SET LOCAL idle_in_transaction_session_timeout = '300s';

\echo
\echo '== 1a. SERVER / SESSION (one row)'
SELECT version() AS server_version, now() AS checked_at,
       current_setting('TimeZone') AS session_timezone, extract(timezone FROM now())::int AS utc_offset_seconds,
       current_setting('server_version_num')::int AS server_version_num;
SELECT current_setting('server_version_num')::int AS srv_num, extract(timezone FROM now())::int AS utc_off \gset

\echo '== 1b. Where does this session''s TimeZone come from? (source: default / configuration file / database / user / client)'
SELECT name, setting, source FROM pg_settings WHERE name IN ('TimeZone','log_timezone');

\echo '== 1c. Database- or role-level TimeZone overrides on this server (rows here beat the server default; names hidden)'
SELECT CASE WHEN d.datname IS NULL THEN '(all databases)' WHEN d.datname = current_database() THEN '(THIS database)' ELSE '(another database)' END AS scope_database,
       CASE WHEN r.rolname IS NULL THEN '(all roles)' WHEN r.rolname = current_user THEN '(THIS role)' ELSE '(another role)' END AS scope_role,
       c AS setting
FROM pg_db_role_setting s
LEFT JOIN pg_database d ON d.oid = s.setdatabase
LEFT JOIN pg_roles r ON r.oid = s.setrole
CROSS JOIN LATERAL unnest(s.setconfig) c
WHERE c ILIKE 'timezone=%';

SELECT (to_regclass('_prisma_migrations') IS NOT NULL)::int AS has_hist \gset
\if :has_hist
\echo '== 2a. MIGRATION HISTORY as recorded by Prisma (finished_at NULL or rolled_back_at set = a failed migration)'
SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count
FROM _prisma_migrations ORDER BY started_at, migration_name;

\echo '== 2b. Failed / incomplete migration records (expect 0 rows)'
SELECT migration_name, started_at, finished_at, rolled_back_at,
       CASE WHEN rolled_back_at IS NOT NULL THEN 'rolled back' ELSE 'started but never finished' END AS problem
FROM _prisma_migrations WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL;
SELECT count(*) AS n_hist_bad FROM _prisma_migrations WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL \gset

\echo '== 2c. THIS REPO (45 migrations) vs AZURE. Only rows that differ are listed; no rows = identical.'
\echo '        PENDING = migrate deploy would apply it. CHECKSUM DIFFERS = file differs from what Azure applied (often only line endings).'
\echo '        NOT IN REPO = Azure applied something this repo does not have (STOP). risk = static scan of the migration file.'
WITH repo(name, checksum, risk) AS (VALUES
    ('20260901081237_foundation_and_brand','96aab8b5941c6cffb0e713c8ba0162ef5039a0e4490efbb37698261f731d3650','additive'),
    ('20260918105430_add_product_and_customer','30081d74255664071df6867f985f9a9ac26665089ef75e9d2e378586ab9ba3c9','additive'),
    ('20260918111605_add_indexes_brand_product_customer','565f441aefd48f94c6a1e5fd5e5fad7d88e42483bf0090f7962c2f90357ac97f','additive'),
    ('20260918112937_add_supplier_table','ccb5ec23a91d1342854064cd475277559cb40b307a06587710e2efa97dec06c4','additive'),
    ('20260919120000_add_sale_and_sale_line','1eebe47ca257ac15c019396edd57e067de6a6c6496a8cd972742dee03cc8d09b','additive'),
    ('20260919130000_add_promotion','71ebcfe804430b21e600056f6c2a6a2d0b82822b6aeed3af5b6e296cc83aef69','additive'),
    ('20260919140000_add_sale_outlet','001621bd3acb738245adf219c6ac93eabe000ee576e044ab44d5483cf0dffd98','additive'),
    ('20260919150000_add_gift_voucher','793a27bcb200075f2dbf41c968ae304ecfc30fc00b315deb18e9d9e4ecbaa956','additive'),
    ('20260919160000_add_loyalty_program','341a7eed8b0035f0d2c97fd519e5a42822093eada21e99a40d31e5ed38bc191f','additive'),
    ('20260919170000_add_sales_quotation','c16f6595b7f4299aa76d5d843ecb6c5f7a3a2a8689e44f0ebca5c501f53470ba','additive'),
    ('20260919180000_add_sales_return','62e9a3484c891d6c48677b4f733440c209e1fd84fb1bed9489f2252f71224515','additive'),
    ('20260919190000_add_sales_order','acac1c965ab9c859e9da3acd99e5386ef90419da2ea506c17df92784d75d4724','additive'),
    ('20260919200000_add_sales_invoice','d0d1cb31bc1af3b684b77447dac2388a07622e2ae95f5f2fedcbae98fea934b6','additive'),
    ('20260919210000_add_barcode_label','2df95a475286cacd92cf7441c9763aef44e97cf9dffb8abdebd542ee62a0591d','additive'),
    ('20260919220000_add_stock_indent','457bb488506bb2ac6c38db81ce031b8cbec91132ecc3298687658b70a83efa72','additive'),
    ('20260919230000_add_stock_transfer','31c953d6078348f59878a9fcca23cd463a848cf2f167e0f9fe66e4c55d999974','additive'),
    ('20260919240000_add_stock_receipt','bfd02c304710681c1fef697a230782846c26602e14a9abef9a75a7e07151981f','additive'),
    ('20260919250000_add_stock_return','088b1b82c754bfbe46dadcae66f98271e065ce015cfb79c30a9616ef25f1c649','additive'),
    ('20260919260000_add_stock_wastage','83163552ac88ef8a6b03ff1444421e2edd0d578746719d95cb63b7a510c624cd','additive'),
    ('20260919270000_add_stock_count','ed9cde94080ff1aea20be4f7fd1008934c43eca4b1d825219eefba9f9ff0bd51','additive'),
    ('20260921090000_add_shift_session','05632b7c74ba2b847b0ca87a39e7b999052bd0deb5e0bfc8dc2840e86a64b4ec','additive'),
    ('20260921100000_add_sale_card_details','943429919ce11b8d8e7c0b9b73f793877f0e2a8f6cd283aa6598503d041f13e9','additive'),
    ('20260921110000_add_sale_upi_details','862b761565598714a416e848b4d21fa3304d2e201937ac372617fa88e9b8d2b0','additive'),
    ('20260921120000_add_sale_payment_reference','d6c0e1db42757044aad9ead0509e5df1c679d2b67711a86d8d231f685d1e808d','additive'),
    ('20260921130000_add_cash_withdrawal','eb1a994e21edaf95aeafbd0fb7615f473fea8248612e1c409e55f2e6a3c53c0c','additive'),
    ('20260921140000_add_cash_deposit','e6a8bb996792d5498be6ebf232cd96f5ae4be5ebc5f0b72a8b943aa2668079ae','additive'),
    ('20260921150000_add_cash_transfer','994e659626600d56e846077142dda7e89a2979388bd5d31a2464214c2108ba03','additive'),
    ('20260921160000_add_shift_closing','8967b4096c80498478ba830c68f84357106fb5e04713a40d508b05c3ffefde19','additive'),
    ('20260921170000_add_expense','aa7ec4461c3f00e9d5e501d4f8e7be2a7281323ba1ad249ca442124caae1266c','additive'),
    ('20260921180000_add_company','03d40be0f8457f73b89488b14116d7919a7dd269aed1d9eafda5afaad560341f','additive'),
    ('20260921190000_add_outlet_details','8b79f0c7594ad37630b0691763e1471beda9be9685eb51b8f32ca95821eaed4d','additive'),
    ('20260922090000_add_warehouse','59c973312b8412812ccca14b10a10fdf7064eaea4cc87361ad8c3b33c61b003e','additive'),
    ('20260922100000_add_product_type','3b3e26328eb0ad5961125e59c46571d26ca7955636b3b2387d0ef59d77ee6333','additive'),
    ('20260922110000_add_uom','56e1ccb31b932c30b3c5ed959dfb235b07356e0910535214c0f31ebec96f641c','additive'),
    ('20260922120000_add_tax_code','a8cb6f1349c14f5c354a057712689e0029ab6dfb0e0a12b461673a3ea4a00220','additive'),
    ('20260922130000_add_hsn_sac','86f9043c76f6be2b9f77eb54ffc83ce9bba5f181cf6d2ade5e8b1ee91834f32a','additive'),
    ('20260923060000_add_selling_price','9fc1519b53f680e5cfc71e50efe7bf4cc05990473666c80f7f81685de7957fb4','additive'),
    ('20260924070000_add_price_list','f351ea49dac46d56a86f606fdd915c33207c24d7add98fcbc70c64cac35ba250','additive'),
    ('20260925080000_add_batch_serial','ccc2b141500403200946044613e7e10f600012fc847d04b2dec228bac91741da','additive'),
    ('20260926090000_add_employee','6312c4e018c5930f3f9281cac302be45b67cf51c55d82a5f27f211ad682cd131','additive'),
    ('20260927100000_add_product_reorder_level','0cc147a53f9988999667b54e1c7c4f6cd2c68bff64a97320d15c1280c582d519','additive'),
    ('20260928090000_move_base_uom_to_group','3ae3edfb5475093c6d2863fd54ea4691d4cc87b3ce3050defd8fd5a1a5179d41','DESTRUCTIVE: copies Uom.baseUom into UomGroup (one value per group) then DROPS column Uom.baseUom'),
    ('20261020073647_baseuom_moved_uomgroup','eb395b73172cc9c3fdae8d1bf096322f6e89a0c24dc289ece7dae70299314d59','CAUTION: drops and re-creates 3 contact foreign keys (brief locks, rows re-validated)'),
    ('20261021090000_add_held_bill','6be79c8935398131140d1e1dac2d39365a5c4d35c5af1b8069c2e217c1a849c5','additive (new tables only)'),
    ('20261023130000_add_tcz_billing','60ce284672b1dad10d725cb6bef7738183b0254ed53563e7e8b6da46d933f125','additive (new tables only)')
), applied AS (
  SELECT migration_name AS name, checksum FROM _prisma_migrations WHERE rolled_back_at IS NULL
), cmp AS (
  SELECT coalesce(r.name, a.name) AS migration,
         CASE WHEN a.name IS NULL THEN 'PENDING'
              WHEN r.name IS NULL THEN 'NOT IN REPO'
              WHEN a.checksum <> r.checksum THEN 'CHECKSUM DIFFERS'
              ELSE 'applied, identical' END AS status,
         coalesce(r.risk, 'unknown (not in this repo)') AS risk
  FROM repo r FULL JOIN applied a ON a.name = r.name
)
SELECT migration, status, risk FROM cmp WHERE status <> 'applied, identical' ORDER BY migration;

WITH repo(name, checksum, risk) AS (VALUES
    ('20260901081237_foundation_and_brand','96aab8b5941c6cffb0e713c8ba0162ef5039a0e4490efbb37698261f731d3650','additive'),
    ('20260918105430_add_product_and_customer','30081d74255664071df6867f985f9a9ac26665089ef75e9d2e378586ab9ba3c9','additive'),
    ('20260918111605_add_indexes_brand_product_customer','565f441aefd48f94c6a1e5fd5e5fad7d88e42483bf0090f7962c2f90357ac97f','additive'),
    ('20260918112937_add_supplier_table','ccb5ec23a91d1342854064cd475277559cb40b307a06587710e2efa97dec06c4','additive'),
    ('20260919120000_add_sale_and_sale_line','1eebe47ca257ac15c019396edd57e067de6a6c6496a8cd972742dee03cc8d09b','additive'),
    ('20260919130000_add_promotion','71ebcfe804430b21e600056f6c2a6a2d0b82822b6aeed3af5b6e296cc83aef69','additive'),
    ('20260919140000_add_sale_outlet','001621bd3acb738245adf219c6ac93eabe000ee576e044ab44d5483cf0dffd98','additive'),
    ('20260919150000_add_gift_voucher','793a27bcb200075f2dbf41c968ae304ecfc30fc00b315deb18e9d9e4ecbaa956','additive'),
    ('20260919160000_add_loyalty_program','341a7eed8b0035f0d2c97fd519e5a42822093eada21e99a40d31e5ed38bc191f','additive'),
    ('20260919170000_add_sales_quotation','c16f6595b7f4299aa76d5d843ecb6c5f7a3a2a8689e44f0ebca5c501f53470ba','additive'),
    ('20260919180000_add_sales_return','62e9a3484c891d6c48677b4f733440c209e1fd84fb1bed9489f2252f71224515','additive'),
    ('20260919190000_add_sales_order','acac1c965ab9c859e9da3acd99e5386ef90419da2ea506c17df92784d75d4724','additive'),
    ('20260919200000_add_sales_invoice','d0d1cb31bc1af3b684b77447dac2388a07622e2ae95f5f2fedcbae98fea934b6','additive'),
    ('20260919210000_add_barcode_label','2df95a475286cacd92cf7441c9763aef44e97cf9dffb8abdebd542ee62a0591d','additive'),
    ('20260919220000_add_stock_indent','457bb488506bb2ac6c38db81ce031b8cbec91132ecc3298687658b70a83efa72','additive'),
    ('20260919230000_add_stock_transfer','31c953d6078348f59878a9fcca23cd463a848cf2f167e0f9fe66e4c55d999974','additive'),
    ('20260919240000_add_stock_receipt','bfd02c304710681c1fef697a230782846c26602e14a9abef9a75a7e07151981f','additive'),
    ('20260919250000_add_stock_return','088b1b82c754bfbe46dadcae66f98271e065ce015cfb79c30a9616ef25f1c649','additive'),
    ('20260919260000_add_stock_wastage','83163552ac88ef8a6b03ff1444421e2edd0d578746719d95cb63b7a510c624cd','additive'),
    ('20260919270000_add_stock_count','ed9cde94080ff1aea20be4f7fd1008934c43eca4b1d825219eefba9f9ff0bd51','additive'),
    ('20260921090000_add_shift_session','05632b7c74ba2b847b0ca87a39e7b999052bd0deb5e0bfc8dc2840e86a64b4ec','additive'),
    ('20260921100000_add_sale_card_details','943429919ce11b8d8e7c0b9b73f793877f0e2a8f6cd283aa6598503d041f13e9','additive'),
    ('20260921110000_add_sale_upi_details','862b761565598714a416e848b4d21fa3304d2e201937ac372617fa88e9b8d2b0','additive'),
    ('20260921120000_add_sale_payment_reference','d6c0e1db42757044aad9ead0509e5df1c679d2b67711a86d8d231f685d1e808d','additive'),
    ('20260921130000_add_cash_withdrawal','eb1a994e21edaf95aeafbd0fb7615f473fea8248612e1c409e55f2e6a3c53c0c','additive'),
    ('20260921140000_add_cash_deposit','e6a8bb996792d5498be6ebf232cd96f5ae4be5ebc5f0b72a8b943aa2668079ae','additive'),
    ('20260921150000_add_cash_transfer','994e659626600d56e846077142dda7e89a2979388bd5d31a2464214c2108ba03','additive'),
    ('20260921160000_add_shift_closing','8967b4096c80498478ba830c68f84357106fb5e04713a40d508b05c3ffefde19','additive'),
    ('20260921170000_add_expense','aa7ec4461c3f00e9d5e501d4f8e7be2a7281323ba1ad249ca442124caae1266c','additive'),
    ('20260921180000_add_company','03d40be0f8457f73b89488b14116d7919a7dd269aed1d9eafda5afaad560341f','additive'),
    ('20260921190000_add_outlet_details','8b79f0c7594ad37630b0691763e1471beda9be9685eb51b8f32ca95821eaed4d','additive'),
    ('20260922090000_add_warehouse','59c973312b8412812ccca14b10a10fdf7064eaea4cc87361ad8c3b33c61b003e','additive'),
    ('20260922100000_add_product_type','3b3e26328eb0ad5961125e59c46571d26ca7955636b3b2387d0ef59d77ee6333','additive'),
    ('20260922110000_add_uom','56e1ccb31b932c30b3c5ed959dfb235b07356e0910535214c0f31ebec96f641c','additive'),
    ('20260922120000_add_tax_code','a8cb6f1349c14f5c354a057712689e0029ab6dfb0e0a12b461673a3ea4a00220','additive'),
    ('20260922130000_add_hsn_sac','86f9043c76f6be2b9f77eb54ffc83ce9bba5f181cf6d2ade5e8b1ee91834f32a','additive'),
    ('20260923060000_add_selling_price','9fc1519b53f680e5cfc71e50efe7bf4cc05990473666c80f7f81685de7957fb4','additive'),
    ('20260924070000_add_price_list','f351ea49dac46d56a86f606fdd915c33207c24d7add98fcbc70c64cac35ba250','additive'),
    ('20260925080000_add_batch_serial','ccc2b141500403200946044613e7e10f600012fc847d04b2dec228bac91741da','additive'),
    ('20260926090000_add_employee','6312c4e018c5930f3f9281cac302be45b67cf51c55d82a5f27f211ad682cd131','additive'),
    ('20260927100000_add_product_reorder_level','0cc147a53f9988999667b54e1c7c4f6cd2c68bff64a97320d15c1280c582d519','additive'),
    ('20260928090000_move_base_uom_to_group','3ae3edfb5475093c6d2863fd54ea4691d4cc87b3ce3050defd8fd5a1a5179d41','DESTRUCTIVE: copies Uom.baseUom into UomGroup (one value per group) then DROPS column Uom.baseUom'),
    ('20261020073647_baseuom_moved_uomgroup','eb395b73172cc9c3fdae8d1bf096322f6e89a0c24dc289ece7dae70299314d59','CAUTION: drops and re-creates 3 contact foreign keys (brief locks, rows re-validated)'),
    ('20261021090000_add_held_bill','6be79c8935398131140d1e1dac2d39365a5c4d35c5af1b8069c2e217c1a849c5','additive (new tables only)'),
    ('20261023130000_add_tcz_billing','60ce284672b1dad10d725cb6bef7738183b0254ed53563e7e8b6da46d933f125','additive (new tables only)')
), applied AS (
  SELECT migration_name AS name, checksum FROM _prisma_migrations WHERE rolled_back_at IS NULL
), cmp AS (
  SELECT coalesce(r.name, a.name) AS migration,
         CASE WHEN a.name IS NULL THEN 'PENDING'
              WHEN r.name IS NULL THEN 'NOT IN REPO'
              WHEN a.checksum <> r.checksum THEN 'CHECKSUM DIFFERS'
              ELSE 'applied, identical' END AS status,
         coalesce(r.risk, 'unknown (not in this repo)') AS risk
  FROM repo r FULL JOIN applied a ON a.name = r.name
)
SELECT count(*) FILTER (WHERE status = 'PENDING') AS n_pending,
       count(*) FILTER (WHERE status = 'CHECKSUM DIFFERS') AS n_differs,
       count(*) FILTER (WHERE status = 'NOT IN REPO') AS n_notinrepo,
       count(*) FILTER (WHERE status = 'PENDING' AND risk LIKE 'DESTRUCTIVE%') AS n_pend_destr,
       count(*) FILTER (WHERE status = 'PENDING' AND risk LIKE 'CAUTION%') AS n_pend_caution
FROM cmp \gset
\else
\echo '== 2. SKIPPED: this database has NO _prisma_migrations table (not created by prisma migrate). STOP: decide how to baseline first.'
\set n_hist_bad -2
\set n_pending -2
\set n_differs -2
\set n_notinrepo -2
\set n_pend_destr -2
\set n_pend_caution -2
\set n_drift -2
\endif

\echo '== 2d. Schema fingerprints (what the database actually contains, independent of the history table)'
SELECT 'Uom.baseUom column (exists only BEFORE 20260928 is applied)' AS fingerprint,
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Uom' AND column_name='baseUom') AS present
UNION ALL SELECT 'UomGroup.baseUom column (exists only AFTER 20260928)',
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='UomGroup' AND column_name='baseUom')
UNION ALL SELECT 'HeldBill table (20261021)', to_regclass('"HeldBill"') IS NOT NULL
UNION ALL SELECT 'HeldBillLine table (20261021)', to_regclass('"HeldBillLine"') IS NOT NULL
UNION ALL SELECT 'Linesales table (20261023)', to_regclass('"Linesales"') IS NOT NULL
UNION ALL SELECT 'LinesaleItemDetails table (20261023)', to_regclass('"LinesaleItemDetails"') IS NOT NULL
UNION ALL SELECT 'LinesaleOfferDetails table (20261023)', to_regclass('"LinesaleOfferDetails"') IS NOT NULL;
\echo '        delete rule of the 3 contact foreign keys (r = RESTRICT after 20261020; c = CASCADE or a = NO ACTION = older rule)'
SELECT conrelid::regclass::text AS on_table, conname, confdeltype AS delete_rule
FROM pg_constraint
WHERE conname IN ('CompanyContact_companyId_fkey','OutletContact_outletId_fkey','WarehouseContact_warehouseId_fkey') ORDER BY 1;

\if :has_hist
SELECT (
  (EXISTS (SELECT 1 FROM _prisma_migrations WHERE migration_name='20260928090000_move_base_uom_to_group' AND finished_at IS NOT NULL AND rolled_back_at IS NULL)
     <> (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='UomGroup' AND column_name='baseUom')
         AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Uom' AND column_name='baseUom')))::int
+ (EXISTS (SELECT 1 FROM _prisma_migrations WHERE migration_name='20261021090000_add_held_bill' AND finished_at IS NOT NULL AND rolled_back_at IS NULL)
     <> (to_regclass('"HeldBill"') IS NOT NULL AND to_regclass('"HeldBillLine"') IS NOT NULL))::int
+ (EXISTS (SELECT 1 FROM _prisma_migrations WHERE migration_name='20261023130000_add_tcz_billing' AND finished_at IS NOT NULL AND rolled_back_at IS NULL)
     <> (to_regclass('"Linesales"') IS NOT NULL AND to_regclass('"LinesaleItemDetails"') IS NOT NULL AND to_regclass('"LinesaleOfferDetails"') IS NOT NULL))::int
) AS n_drift \gset
\endif

SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Uom' AND column_name='baseUom')::int AS has_uom_base \gset
\if :has_uom_base
\echo '== 2e. DATA IMPACT of 20260928 (Uom.baseUom still exists, so that migration has NOT run). That migration keeps ONE base UOM per group (the alphabetical MIN) and drops the column.'
SELECT (SELECT count(*) FROM (SELECT "groupId" FROM "Uom" WHERE "groupId" IS NOT NULL AND "baseUom" IS NOT NULL GROUP BY "groupId" HAVING count(DISTINCT "baseUom") > 1) x) AS groups_with_conflicting_base_uoms,
       (SELECT count(*) FROM "Uom" WHERE "groupId" IS NULL AND "baseUom" IS NOT NULL) AS uoms_with_base_but_no_group_value_would_be_lost,
       (SELECT count(*) FROM "Uom" WHERE "baseUom" IS NOT NULL) AS uoms_with_a_base_uom;
SELECT (SELECT count(*) FROM (SELECT "groupId" FROM "Uom" WHERE "groupId" IS NOT NULL AND "baseUom" IS NOT NULL GROUP BY "groupId" HAVING count(DISTINCT "baseUom") > 1) x)
     + (SELECT count(*) FROM "Uom" WHERE "groupId" IS NULL AND "baseUom" IS NOT NULL) AS n_uom_conflict \gset
\else
\echo '== 2e. skipped: Uom.baseUom does not exist (20260928 already applied, or never needed).'
\set n_uom_conflict -2
\endif

SELECT (to_regclass('"Linesales"') IS NOT NULL AND to_regclass('"LinesaleItemDetails"') IS NOT NULL)::int AS has_tcz \gset
\echo '== 3a. Column types that matter for time handling'
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE (table_name IN ('Linesales','LinesaleItemDetails','LinesaleOfferDetails') AND (data_type LIKE 'timestamp%' OR data_type LIKE 'time%'))
   OR (table_name = 'Sale' AND column_name IN ('createdAt','updatedAt'))
ORDER BY table_name, column_name;

\if :has_tcz
\echo '== 3b. TCZ tables EXIST on this database. Row counts:'
SELECT (SELECT count(*) FROM "Linesales") AS headers, (SELECT count(*) FROM "LinesaleItemDetails") AS lines, (SELECT count(*) FROM "LinesaleOfferDetails") AS offers,
       (SELECT count(*) FROM "Linesales" WHERE "SaleId" IS NULL) AS headers_without_sale;
SELECT count(*) AS n_tcz_headers FROM "Linesales" \gset

\echo '== 3c. CreateDate minus Sale.createdAt, in hours. Healthy = a single row with 0.00.'
\echo '        A bucket like 5.50, -5.50 or 7.00 = written by a session that was NOT UTC (CreateDate stored shifted).'
SELECT round(extract(epoch FROM (h."CreateDate" - (s."createdAt" AT TIME ZONE 'UTC'))) / 3600.0, 2) AS shift_hours, count(*) AS headers,
       min(h."CreateDate") AS first_create_date, max(h."CreateDate") AS last_create_date
FROM "Linesales" h JOIN "Sale" s ON s.id = h."SaleId"
GROUP BY 1 ORDER BY 2 DESC;
SELECT count(*) AS n_shifted
FROM "Linesales" h JOIN "Sale" s ON s.id = h."SaleId"
WHERE abs(extract(epoch FROM (h."CreateDate" - (s."createdAt" AT TIME ZONE 'UTC')))) > 60 \gset

\echo '== 3d. CreateTime must equal the IST (Asia/Kolkata) time of CreateDate. Expect 0.'
SELECT count(*) AS createtime_not_ist
FROM "Linesales" h
WHERE h."CreateTime" IS DISTINCT FROM ((h."CreateDate" AT TIME ZONE 'Asia/Kolkata')::time(6));
SELECT count(*) AS n_ct_bad FROM "Linesales" h
WHERE h."CreateTime" IS DISTINCT FROM ((h."CreateDate" AT TIME ZONE 'Asia/Kolkata')::time(6)) \gset

\echo '== 3e. Bill-number collisions: completed sales whose (tenant, bill number) is already used by ANOTHER TCZ header (the backfill would skip them). Expect 0.'
SELECT count(*) AS collisions
FROM "Sale" s JOIN "Linesales" t ON t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo"
WHERE s.status = 'COMPLETED' AND t."SaleId" IS DISTINCT FROM s.id;
SELECT count(*) AS n_collisions
FROM "Sale" s JOIN "Linesales" t ON t."TenantId" = s."tenantId" AND t."DocNum" = s."billNo"
WHERE s.status = 'COMPLETED' AND t."SaleId" IS DISTINCT FROM s.id \gset
\echo '        For the full 25-check report on an already-migrated database run scripts/verify-tcz-backfill.sql (also read-only).'
\else
\echo '== 3b-3e. SKIPPED: the TCZ tables do not exist on this database yet (expected before the migration).'
\set n_tcz_headers -2
\set n_shifted -2
\set n_ct_bad -2
\set n_collisions -2
\endif

\echo '== 4a. What this database account can do (the account that will run prisma migrate deploy)'
SELECT r.rolsuper, r.rolcreaterole, r.rolcreatedb,
       has_database_privilege(current_user, current_database(), 'CREATE')  AS can_create_in_db,
       has_schema_privilege(current_user, 'public', 'USAGE')  AS public_schema_usage,
       has_schema_privilege(current_user, 'public', 'CREATE') AS public_schema_create,
       (r.rolsuper OR pg_has_role(current_user, 'pg_read_all_stats', 'MEMBER')) AS can_see_all_sessions
FROM pg_roles r WHERE r.rolname = current_user;
SELECT has_schema_privilege(current_user, 'public', 'CREATE')::int AS can_create_public,
       (r.rolsuper OR pg_has_role(current_user, 'pg_read_all_stats', 'MEMBER'))::int AS sees_all
FROM pg_roles r WHERE r.rolname = current_user \gset

\echo '== 4b. Tables the migrations touch: do you own them (or belong to the owner role), and can you REFERENCE them? (names hidden)'
\echo '        Needed: REFERENCES on Tenant, Outlet, Sale, Product (new foreign keys); ownership of the contact/Uom tables only if older migrations are pending.'
SELECT t.tablename, pg_has_role(current_user, t.tableowner, 'MEMBER') AS is_owner_or_member,
       has_table_privilege(current_user, format('%I.%I', t.schemaname, t.tablename), 'REFERENCES') AS can_reference,
       has_table_privilege(current_user, format('%I.%I', t.schemaname, t.tablename), 'SELECT') AS can_select,
       has_table_privilege(current_user, format('%I.%I', t.schemaname, t.tablename), 'INSERT') AS can_insert
FROM pg_tables t
WHERE t.schemaname = 'public' AND t.tablename IN ('Tenant','Outlet','Sale','SaleLine','Product','Customer','_prisma_migrations',
      'Uom','UomGroup','CompanyContact','OutletContact','WarehouseContact','HeldBill','HeldBillLine','Linesales','LinesaleItemDetails','LinesaleOfferDetails')
ORDER BY 1;
SELECT (4 - count(*) FILTER (WHERE t.tablename IN ('Tenant','Outlet','Sale','Product')))
     + count(*) FILTER (WHERE t.tablename IN ('Tenant','Outlet','Sale','Product')
                         AND NOT has_table_privilege(current_user, format('%I.%I', t.schemaname, t.tablename), 'REFERENCES')) AS n_parent_noref,
       count(*) FILTER (WHERE t.tablename IN ('Uom','UomGroup','CompanyContact','OutletContact','WarehouseContact')
                         AND NOT pg_has_role(current_user, t.tableowner, 'MEMBER')) AS n_notowner
FROM pg_tables t WHERE t.schemaname = 'public' \gset
SELECT coalesce(has_table_privilege(current_user, to_regclass('_prisma_migrations'), 'INSERT')::int, 0) AS can_write_hist \gset

\echo '== 4c. Which roles hold connections to this database right now? (names hidden; the app should normally use ONE role)'
SELECT CASE WHEN usename = current_user THEN '(this session''s role)' ELSE '(another role)' END AS role_label, count(*) AS connections
FROM pg_stat_activity WHERE datname = current_database() GROUP BY 1 ORDER BY 2 DESC;

\echo '== 5a. Size and volume (helps estimate backfill time)'
SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size,
       (SELECT count(*) FROM "Sale") AS sales, (SELECT count(*) FROM "SaleLine") AS sale_lines,
       (SELECT count(*) FROM "Sale" WHERE status = 'COMPLETED') AS completed_sales;

\echo '== 5b. Transactions open for more than 1 minute (they could make the migration''s short foreign-key locks queue). Expect no rows.'
SELECT pid, state, xact_start, now() - xact_start AS open_for, wait_event_type
FROM pg_stat_activity
WHERE datname = current_database() AND xact_start IS NOT NULL AND now() - xact_start > interval '1 minute' AND pid <> pg_backend_pid();
SELECT count(*) AS n_long_tx FROM pg_stat_activity
WHERE datname = current_database() AND xact_start IS NOT NULL AND now() - xact_start > interval '1 minute' AND pid <> pg_backend_pid() \gset
SELECT count(*) AS n_lock_waits FROM pg_stat_activity
WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid() \gset

\echo '== 5c. Payment methods in use on completed sales (the TCZ tender columns only know cash / card / upi / wallet)'
SELECT '[' || "paymentMethod" || ']' AS payment_method_as_stored, count(*) AS sales FROM "Sale" WHERE status = 'COMPLETED' GROUP BY 1 ORDER BY 2 DESC;

\echo
\echo '=================================== SUMMARY: PASS / WARNING / FAIL ==================================='
\echo 'UNKNOWN = that check could not run (see the error above it);  N/A = not applicable here;  INFO = just a number to report.'
WITH s(n, chk, result, detail) AS (VALUES
 (1,  'Server version >= PostgreSQL 13 (needed by verify script)', CASE WHEN :srv_num < 0 THEN 'UNKNOWN' WHEN :srv_num >= 130000 THEN 'PASS' ELSE 'WARNING' END, (:srv_num)::text),
 (2,  'Prisma migration history table exists', CASE WHEN :has_hist = 1 THEN 'PASS' ELSE 'FAIL' END, 'has_hist=' || :has_hist),
 (3,  'No failed / unfinished migration records', CASE WHEN :n_hist_bad = -2 THEN 'N/A' WHEN :n_hist_bad < 0 THEN 'UNKNOWN' WHEN :n_hist_bad = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_hist_bad)::text),
 (4,  'No migration applied on Azure that is missing from the repo', CASE WHEN :n_notinrepo = -2 THEN 'N/A' WHEN :n_notinrepo < 0 THEN 'UNKNOWN' WHEN :n_notinrepo = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_notinrepo)::text),
 (5,  'Checksum differences (applied file differs from repo file)', CASE WHEN :n_differs = -2 THEN 'N/A' WHEN :n_differs < 0 THEN 'UNKNOWN' WHEN :n_differs = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_differs)::text),
 (6,  'Pending DESTRUCTIVE migration (20260928: UPDATE + DROP COLUMN)', CASE WHEN :n_pend_destr = -2 THEN 'N/A' WHEN :n_pend_destr < 0 THEN 'UNKNOWN' WHEN :n_pend_destr = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_pend_destr)::text),
 (7,  'Pending CAUTION migration (20261020: foreign keys re-created)', CASE WHEN :n_pend_caution = -2 THEN 'N/A' WHEN :n_pend_caution < 0 THEN 'UNKNOWN' WHEN :n_pend_caution = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_pend_caution)::text),
 (8,  'Total pending migrations (expected: held_bill and/or tcz_billing only)', CASE WHEN :n_pending = -2 THEN 'N/A' WHEN :n_pending < 0 THEN 'UNKNOWN' ELSE 'INFO' END, (:n_pending)::text),
 (9,  'History agrees with the real schema (no drift)', CASE WHEN :n_drift = -2 THEN 'N/A' WHEN :n_drift < 0 THEN 'UNKNOWN' WHEN :n_drift = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_drift)::text),
 (10, 'Base-UOM data that 20260928 would collapse or lose', CASE WHEN :n_uom_conflict = -2 THEN 'N/A' WHEN :n_uom_conflict < 0 THEN 'UNKNOWN' WHEN :n_uom_conflict = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_uom_conflict)::text),
 (11, 'This session''s time zone is UTC (app pins UTC itself)', CASE WHEN :utc_off < 0 AND :srv_num < 0 THEN 'UNKNOWN' WHEN :utc_off = 0 THEN 'PASS' ELSE 'WARNING' END, 'offset seconds=' || :utc_off),
 (12, 'TCZ tables already exist: header count', CASE WHEN :n_tcz_headers = -2 THEN 'N/A' WHEN :n_tcz_headers < 0 THEN 'UNKNOWN' ELSE 'INFO' END, (:n_tcz_headers)::text),
 (13, 'TCZ headers whose CreateDate is shifted (> 60 s from Sale)', CASE WHEN :n_shifted = -2 THEN 'N/A' WHEN :n_shifted < 0 THEN 'UNKNOWN' WHEN :n_shifted = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_shifted)::text),
 (14, 'TCZ headers whose CreateTime is not the IST time of CreateDate', CASE WHEN :n_ct_bad = -2 THEN 'N/A' WHEN :n_ct_bad < 0 THEN 'UNKNOWN' WHEN :n_ct_bad = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_ct_bad)::text),
 (15, 'Bill-number collisions (backfill would skip these sales)', CASE WHEN :n_collisions = -2 THEN 'N/A' WHEN :n_collisions < 0 THEN 'UNKNOWN' WHEN :n_collisions = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_collisions)::text),
 (16, 'Can create objects in schema public', CASE WHEN :can_create_public < 0 THEN 'UNKNOWN' WHEN :can_create_public = 1 THEN 'PASS' ELSE 'FAIL' END, (:can_create_public)::text),
 (17, 'Can REFERENCE Tenant, Outlet, Sale, Product (0 = all four ok)', CASE WHEN :n_parent_noref < 0 THEN 'UNKNOWN' WHEN :n_parent_noref = 0 THEN 'PASS' ELSE 'FAIL' END, (:n_parent_noref)::text),
 (18, 'Owns / belongs to owner of the Uom and contact tables (0 = ok)', CASE WHEN :n_notowner < 0 THEN 'UNKNOWN' WHEN :n_notowner = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_notowner)::text),
 (19, 'Can write the migration history table', CASE WHEN :has_hist = 0 THEN 'N/A' WHEN :can_write_hist < 0 THEN 'UNKNOWN' WHEN :can_write_hist = 1 THEN 'PASS' ELSE 'FAIL' END, (:can_write_hist)::text),
 (20, 'No transaction open > 1 minute (lock risk)', CASE WHEN :n_long_tx < 0 THEN 'UNKNOWN' WHEN :n_long_tx > 0 THEN 'WARNING' WHEN :sees_all = 1 THEN 'PASS' ELSE 'WARNING' END,
      (:n_long_tx)::text || CASE WHEN :sees_all = 1 THEN '' ELSE ' (this account CANNOT see other users'' sessions: result not conclusive)' END),
 (21, 'No sessions waiting on locks right now', CASE WHEN :n_lock_waits < 0 THEN 'UNKNOWN' WHEN :n_lock_waits = 0 THEN 'PASS' ELSE 'WARNING' END, (:n_lock_waits)::text)
)
SELECT n, chk, result, detail FROM s
UNION ALL
SELECT 99, 'TALLY', string_agg(r || '=' || c, '   ' ORDER BY r), ''
FROM (SELECT result AS r, count(*) AS c FROM s GROUP BY result) t
ORDER BY 1;

ROLLBACK;
