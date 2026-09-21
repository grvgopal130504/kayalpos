-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "outletId" TEXT;

-- CreateIndex
CREATE INDEX "Sale_tenantId_outletId_idx" ON "Sale"("tenantId", "outletId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
