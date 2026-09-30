-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN "outletType" TEXT,
ADD COLUMN "companyName" TEXT,
ADD COLUMN "registrationNo" TEXT,
ADD COLUMN "gstin" TEXT,
ADD COLUMN "panNo" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "mobile" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "logoName" TEXT,
ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "addressLine2" TEXT,
ADD COLUMN "addressLine3" TEXT,
ADD COLUMN "addressLine4" TEXT,
ADD COLUMN "addressLandmark" TEXT;

-- CreateTable
CREATE TABLE "OutletContact" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutletContact_outletId_idx" ON "OutletContact"("outletId");

-- AddForeignKey
ALTER TABLE "OutletContact" ADD CONSTRAINT "OutletContact_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
