-- CreateEnum
CREATE TYPE "BatchSerialType" AS ENUM ('BATCH', 'SERIAL');

-- CreateTable
CREATE TABLE "BatchSerial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "BatchSerialType" NOT NULL,
    "mfgDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "warehouseId" TEXT,
    "qty" DECIMAL(14,2) NOT NULL DEFAULT 1,
    "uom" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchSerial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchSerial_tenantId_status_idx" ON "BatchSerial"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BatchSerial_productId_idx" ON "BatchSerial"("productId");

-- CreateIndex
CREATE INDEX "BatchSerial_warehouseId_idx" ON "BatchSerial"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchSerial_tenantId_number_key" ON "BatchSerial"("tenantId", "number");

-- AddForeignKey
ALTER TABLE "BatchSerial" ADD CONSTRAINT "BatchSerial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSerial" ADD CONSTRAINT "BatchSerial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSerial" ADD CONSTRAINT "BatchSerial_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
