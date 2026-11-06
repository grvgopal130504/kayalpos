-- AppUser.sql vs. the live User model: port the five genuinely missing
-- fields (Code, PinHash, a real link to Employee, a real link to Outlet,
-- and LastLogin). All nullable additions; no existing rows affected.

ALTER TABLE "User" ADD COLUMN "Code" TEXT;
ALTER TABLE "User" ADD COLUMN "PinHash" TEXT;
ALTER TABLE "User" ADD COLUMN "EmployeeId" TEXT;
ALTER TABLE "User" ADD COLUMN "OutletId" TEXT;
ALTER TABLE "User" ADD COLUMN "LastLogin" TIMESTAMP(3);

ALTER TABLE "User" ADD CONSTRAINT "User_EmployeeId_fkey" FOREIGN KEY ("EmployeeId") REFERENCES "Employee"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_OutletId_fkey" FOREIGN KEY ("OutletId") REFERENCES "Outlet"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
