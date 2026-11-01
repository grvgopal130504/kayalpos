-- CreateTable
CREATE TABLE "TCZ_OPOS" (
    "DocEntry" BIGSERIAL NOT NULL,
    "TenantId" TEXT NOT NULL,
    "OutletId" TEXT,
    "SaleId" TEXT,
    "ClientToken" TEXT,
    "DocNum" VARCHAR(255),
    "CreateDate" TIMESTAMPTZ(6),
    "CreateTime" TIME(6),
    "UpdateDate" TIMESTAMPTZ(6),
    "UpdateTime" TIME(6),
    "CreatedBy" VARCHAR(500),
    "UpdatedBy" VARCHAR(500),
    "ChangeLog" VARCHAR(50),
    "Canceled" VARCHAR(5),
    "Object" VARCHAR(20) DEFAULT 'TCZ_OPOS',
    "SalesType" VARCHAR(5),
    "Hold" VARCHAR(5),
    "CustomerMobileNumber" VARCHAR(20),
    "CustomerName" VARCHAR(255),
    "BPName" VARCHAR(255),
    "BPCode" VARCHAR(255),
    "RedeemValue" DECIMAL(19,6) DEFAULT 0,
    "RoundOff" DECIMAL(19,6) DEFAULT 0,
    "HeadDiscTyp" VARCHAR(30),
    "HeaderDiscount" DECIMAL(19,6) DEFAULT 0,
    "DiscountType" VARCHAR(30),
    "DiscountAmount" DECIMAL(19,6) DEFAULT 0,
    "TaxableValue" DECIMAL(19,6),
    "TaxableValueTotal" DECIMAL(19,6) DEFAULT 0,
    "GrandTotal" DECIMAL(19,6) DEFAULT 0,
    "SlpCode1" VARCHAR(255),
    "SlpCode2" VARCHAR(255),
    "SlpName1" VARCHAR(255),
    "SlpName2" VARCHAR(255),
    "Points" INTEGER DEFAULT 0,
    "EarnedPoints" INTEGER DEFAULT 0,
    "TotalRevenue" DECIMAL(19,6) DEFAULT 0,
    "DocStatus" VARCHAR(10),
    "Cash" DECIMAL(19,6) DEFAULT 0,
    "Card" DECIMAL(19,6) DEFAULT 0,
    "UPI" DECIMAL(19,6) DEFAULT 0,
    "Wallet" DECIMAL(19,6) DEFAULT 0,
    "CreditCard" DECIMAL(19,6) DEFAULT 0,
    "Balance" DECIMAL(19,6) DEFAULT 0,
    "Paid" DECIMAL(19,6) DEFAULT 0,
    "Batch" VARCHAR(10),
    "Return" VARCHAR(10),
    "Free" VARCHAR(10),
    "InvNum" INTEGER DEFAULT 0,
    "InvEntry" BIGINT DEFAULT 0,
    "InvRemarks" VARCHAR(255),
    CONSTRAINT "TCZ_OPOS_pkey" PRIMARY KEY ("DocEntry")
);

-- CreateTable
CREATE TABLE "TCZ_POS1" (
    "DocEntry" BIGINT NOT NULL,
    "LineId" INTEGER NOT NULL,
    "ProductId" TEXT,
    "Object" VARCHAR(10) DEFAULT 'TCZ_OPOS',
    "ItemCode" VARCHAR(255),
    "ItemName" VARCHAR(255),
    "Price" DECIMAL(19,6) DEFAULT 0,
    "Quantity" DECIMAL(19,6) DEFAULT 0,
    "DisCount" DECIMAL(19,6) DEFAULT 0,
    "DisCountValue" DECIMAL(19,6) DEFAULT 0,
    "LineTotal" DECIMAL(19,6) DEFAULT 0,
    "BarCode" VARCHAR(255),
    "InStock" DECIMAL(19,6) DEFAULT 0,
    "TaxableValue" DECIMAL(19,6) DEFAULT 0,
    "TaxCode" VARCHAR(100),
    "Tax" DECIMAL(19,6) DEFAULT 0,
    "TaxValue" DECIMAL(19,6) DEFAULT 0,
    "DiscountName" VARCHAR(255),
    "OfferQty" DECIMAL(19,6) DEFAULT 0,
    "SalesQty" DECIMAL(19,6) DEFAULT 0,
    "ReturnBill" VARCHAR(255),
    CONSTRAINT "TCZ_POS1_pkey" PRIMARY KEY ("DocEntry", "LineId")
);

-- CreateTable
CREATE TABLE "TCZ_POS2" (
    "DocEntry" BIGINT NOT NULL,
    "LineId" INTEGER NOT NULL,
    "Object" VARCHAR(10) DEFAULT 'TCZ_OPOS',
    "DiscountName" VARCHAR(255),
    "Priority" INTEGER,
    "EffectiveFrom" TIMESTAMPTZ(6),
    "EffectiveTo" TIMESTAMPTZ(6),
    "FreeQty" DECIMAL(19,6) DEFAULT 0,
    "ScanQty" DECIMAL(19,6) DEFAULT 0,
    "DiscType" VARCHAR(20),
    CONSTRAINT "TCZ_POS2_pkey" PRIMARY KEY ("DocEntry", "LineId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TCZ_OPOS_TenantId_DocNum_key" ON "TCZ_OPOS"("TenantId", "DocNum");

-- CreateIndex
CREATE UNIQUE INDEX "TCZ_OPOS_TenantId_ClientToken_key" ON "TCZ_OPOS"("TenantId", "ClientToken");

-- CreateIndex
CREATE UNIQUE INDEX "TCZ_OPOS_SaleId_key" ON "TCZ_OPOS"("SaleId");

-- CreateIndex
CREATE INDEX "TCZ_OPOS_TenantId_CreateDate_idx" ON "TCZ_OPOS"("TenantId", "CreateDate");

-- CreateIndex
CREATE INDEX "TCZ_OPOS_TenantId_OutletId_idx" ON "TCZ_OPOS"("TenantId", "OutletId");

-- CreateIndex
CREATE INDEX "TCZ_OPOS_TenantId_CustomerMobileNumber_idx" ON "TCZ_OPOS"("TenantId", "CustomerMobileNumber");

-- CreateIndex
CREATE INDEX "TCZ_POS1_ProductId_idx" ON "TCZ_POS1"("ProductId");

-- CreateIndex
CREATE INDEX "TCZ_POS1_ItemCode_idx" ON "TCZ_POS1"("ItemCode");

-- AddForeignKey
ALTER TABLE "TCZ_OPOS" ADD CONSTRAINT "TCZ_OPOS_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TCZ_OPOS" ADD CONSTRAINT "TCZ_OPOS_OutletId_fkey" FOREIGN KEY ("OutletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TCZ_OPOS" ADD CONSTRAINT "TCZ_OPOS_SaleId_fkey" FOREIGN KEY ("SaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TCZ_POS1" ADD CONSTRAINT "TCZ_POS1_DocEntry_fkey" FOREIGN KEY ("DocEntry") REFERENCES "TCZ_OPOS"("DocEntry") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TCZ_POS1" ADD CONSTRAINT "TCZ_POS1_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TCZ_POS2" ADD CONSTRAINT "TCZ_POS2_DocEntry_fkey" FOREIGN KEY ("DocEntry") REFERENCES "TCZ_OPOS"("DocEntry") ON DELETE CASCADE ON UPDATE CASCADE;
