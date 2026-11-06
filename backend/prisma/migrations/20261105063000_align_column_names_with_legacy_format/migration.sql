-- Align physical column names with the legacy reference SQL scripts.
-- Pure casing/naming fixes only (e.g. Gstin -> GSTIN) — no data, no type,
-- and no Prisma field-name change, so no application code is affected.

ALTER TABLE "Company" RENAME COLUMN "Gstin" TO "GSTIN";
ALTER TABLE "Company" RENAME COLUMN "PanNo" TO "PANNo";
ALTER TABLE "Outlet" RENAME COLUMN "Gstin" TO "GSTIN";
ALTER TABLE "Outlet" RENAME COLUMN "PanNo" TO "PANNo";
ALTER TABLE "Customer" RENAME COLUMN "Gstin" TO "GSTIN";
ALTER TABLE "Supplier" RENAME COLUMN "GstNo" TO "GSTNo";
ALTER TABLE "HsnSac" RENAME COLUMN "Uqc" TO "UQC";
ALTER TABLE "Product" RENAME COLUMN "Mrp" TO "MRP";
ALTER TABLE "SellingPrice" RENAME COLUMN "Mrp" TO "MRP";
ALTER TABLE "User" RENAME COLUMN "Username" TO "UserName";
