-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "calculationType" TEXT NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxCode_tenantId_status_idx" ON "TaxCode"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_tenantId_code_key" ON "TaxCode"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "TaxCode" ADD CONSTRAINT "TaxCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
