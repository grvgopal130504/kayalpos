-- Add the SAP-sync tracking and audit-by columns from the legacy reference
-- scripts that don't exist anywhere in the current schema yet. All five are
-- nullable or defaulted, so every existing row and every existing query keeps
-- working unchanged; nothing is read or written to them until app code is
-- wired up to use them.

ALTER TABLE "Brand" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Brand" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Brand" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Brand" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Brand" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Company" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Company" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Company" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Company" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Customer" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Customer" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Customer" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Customer" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Employee" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Employee" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Employee" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Employee" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Employee" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "GiftVoucher" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "GiftVoucher" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "GiftVoucher" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "GiftVoucher" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "GiftVoucher" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "HsnSac" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "HsnSac" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "HsnSac" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "HsnSac" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "HsnSac" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "LoyaltyProgram" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "LoyaltyProgram" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "LoyaltyProgram" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "LoyaltyProgram" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "LoyaltyProgram" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Outlet" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Outlet" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Outlet" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Outlet" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Outlet" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "PriceList" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "PriceList" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "PriceList" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "PriceList" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "PriceList" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Product" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Product" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Product" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Product" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Promotion" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Promotion" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Promotion" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Promotion" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Promotion" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "SellingPrice" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "SellingPrice" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "SellingPrice" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "SellingPrice" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "SellingPrice" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Supplier" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Supplier" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Supplier" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Supplier" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "TaxCode" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "TaxCode" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "TaxCode" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "TaxCode" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "TaxCode" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Uom" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Uom" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Uom" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Uom" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Uom" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "UomGroup" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "UomGroup" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "UomGroup" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "UomGroup" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "UomGroup" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "Warehouse" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "Warehouse" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "Warehouse" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "Warehouse" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "Warehouse" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "BatchSerial" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "BatchSerial" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "BatchSerial" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "BatchSerial" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "BatchSerial" ADD COLUMN "UpdatedBy" TEXT;

ALTER TABLE "User" ADD COLUMN "SapRef" TEXT;
ALTER TABLE "User" ADD COLUMN "SapSyncStatus" TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE "User" ADD COLUMN "SapSyncDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "CreatedBy" TEXT;
ALTER TABLE "User" ADD COLUMN "UpdatedBy" TEXT;

