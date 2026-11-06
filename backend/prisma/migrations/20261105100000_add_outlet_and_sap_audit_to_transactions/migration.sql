-- Transaction-side port of the legacy reference scripts:
-- 1) add an optional OutletId to SalesInvoice/SalesOrder/SalesQuotation,
--    which had no outlet scoping at all (confirmed gap vs. the script).
-- 2) add the same universal SAP-sync + audit + terms columns used on the
--    Masters pass to all 11 transaction document headers.
-- All additions are nullable or defaulted; no existing data changes.

ALTER TABLE "SalesInvoice" ADD COLUMN "OutletId" TEXT;
ALTER TABLE "SalesOrder" ADD COLUMN "OutletId" TEXT;
ALTER TABLE "SalesQuotation" ADD COLUMN "OutletId" TEXT;

ALTER TABLE "SalesInvoice" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "SalesInvoice" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "SalesInvoice" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "SalesInvoice" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "SalesInvoice" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "SalesOrder" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "SalesOrder" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "SalesOrder" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "SalesOrder" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "SalesOrder" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "SalesQuotation" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "SalesQuotation" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "SalesQuotation" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "SalesQuotation" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "SalesQuotation" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "SalesReturn" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "SalesReturn" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "SalesReturn" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "SalesReturn" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "SalesReturn" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockCount" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockCount" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockCount" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockCount" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockCount" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockIndent" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockIndent" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockIndent" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockIndent" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockIndent" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockReceipt" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockReceipt" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockReceipt" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockReceipt" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockReceipt" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockReturn" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockReturn" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockReturn" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockReturn" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockReturn" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockTransfer" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockTransfer" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockTransfer" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockTransfer" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockTransfer" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "StockWastage" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "StockWastage" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "StockWastage" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "StockWastage" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "StockWastage" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "BarcodeLabelBatch" ADD COLUMN "TermsConditions" TEXT;
ALTER TABLE "BarcodeLabelBatch" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "BarcodeLabelBatch" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "BarcodeLabelBatch" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "BarcodeLabelBatch" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_OutletId_fkey" FOREIGN KEY ("OutletId") REFERENCES "Outlet"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_OutletId_fkey" FOREIGN KEY ("OutletId") REFERENCES "Outlet"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesQuotation" ADD CONSTRAINT "SalesQuotation_OutletId_fkey" FOREIGN KEY ("OutletId") REFERENCES "Outlet"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
