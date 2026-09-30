-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "brand" TEXT,
    "uom" TEXT NOT NULL,
    "hsnSac" TEXT,
    "taxCode" TEXT,
    "salePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mrp" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "gstin" TEXT,
    "customerType" TEXT NOT NULL,
    "group" TEXT,
    "priceCategory" TEXT,
    "creditLimit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "openingBalanceType" TEXT NOT NULL DEFAULT 'Cr',
    "address" TEXT,
    "salesRepresentative" TEXT,
    "territory" TEXT,
    "allowCreditSale" BOOLEAN NOT NULL DEFAULT true,
    "priceInclusive" BOOLEAN NOT NULL DEFAULT false,
    "smsNotification" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_code_key" ON "Product"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_code_key" ON "Customer"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
