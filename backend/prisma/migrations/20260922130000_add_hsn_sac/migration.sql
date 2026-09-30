-- CreateTable
CREATE TABLE "HsnSac" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "chapter" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "uqc" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HsnSac_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HsnSac_tenantId_status_idx" ON "HsnSac"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HsnSac_tenantId_code_key" ON "HsnSac"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "HsnSac" ADD CONSTRAINT "HsnSac_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
