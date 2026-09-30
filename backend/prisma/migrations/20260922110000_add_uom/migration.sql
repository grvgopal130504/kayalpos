-- CreateTable
CREATE TABLE "UomGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UomGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uom" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT,
    "baseUom" TEXT,
    "conversionFactor" DECIMAL(14,6),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UomGroup_tenantId_status_idx" ON "UomGroup"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UomGroup_tenantId_code_key" ON "UomGroup"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Uom_tenantId_status_idx" ON "Uom"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Uom_groupId_idx" ON "Uom"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Uom_tenantId_code_key" ON "Uom"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "UomGroup" ADD CONSTRAINT "UomGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uom" ADD CONSTRAINT "Uom_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uom" ADD CONSTRAINT "Uom_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "UomGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
