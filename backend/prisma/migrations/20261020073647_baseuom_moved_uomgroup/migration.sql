-- DropForeignKey
ALTER TABLE "CompanyContact" DROP CONSTRAINT "CompanyContact_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OutletContact" DROP CONSTRAINT "OutletContact_outletId_fkey";

-- DropForeignKey
ALTER TABLE "WarehouseContact" DROP CONSTRAINT "WarehouseContact_warehouseId_fkey";

-- AddForeignKey
ALTER TABLE "OutletContact" ADD CONSTRAINT "OutletContact_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseContact" ADD CONSTRAINT "WarehouseContact_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContact" ADD CONSTRAINT "CompanyContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
