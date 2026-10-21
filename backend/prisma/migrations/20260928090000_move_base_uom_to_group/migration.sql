-- AlterTable
ALTER TABLE "UomGroup" ADD COLUMN "baseUom" TEXT;

-- Carry over existing data: a group's base UOM is the base UOM its UOMs were using.
UPDATE "UomGroup" g
SET "baseUom" = sub."baseUom"
FROM (
    SELECT "groupId", MIN("baseUom") AS "baseUom"
    FROM "Uom"
    WHERE "groupId" IS NOT NULL AND "baseUom" IS NOT NULL
    GROUP BY "groupId"
) sub
WHERE g."id" = sub."groupId";

-- AlterTable
ALTER TABLE "Uom" DROP COLUMN "baseUom";
