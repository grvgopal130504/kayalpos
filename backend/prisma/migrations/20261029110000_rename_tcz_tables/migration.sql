-- Rename the TCZ billing tables to their final names:
--   TCZ_OPOS -> Linesales, TCZ_POS1 -> LinesaleItemDetails, TCZ_POS2 -> LinesaleOfferDetails
-- Pure rename: no data is touched except the informational "Object" label.
-- Constraint / index / sequence names are renamed too so they match what
-- Prisma derives from the new table names (keeps `migrate dev` drift-free).

ALTER TABLE "TCZ_OPOS" RENAME TO "Linesales";
ALTER TABLE "TCZ_POS1" RENAME TO "LinesaleItemDetails";
ALTER TABLE "TCZ_POS2" RENAME TO "LinesaleOfferDetails";

DO $$
DECLARE
  r record;
  m text[][] := ARRAY[
    ['TCZ_OPOS', 'Linesales'],
    ['TCZ_POS1', 'LinesaleItemDetails'],
    ['TCZ_POS2', 'LinesaleOfferDetails']
  ];
  i int;
  old_prefix text;
  new_prefix text;
BEGIN
  FOR i IN 1 .. array_length(m, 1) LOOP
    old_prefix := m[i][1];
    new_prefix := m[i][2];

    -- primary keys, foreign keys, unique constraints (a pkey rename also renames its index)
    FOR r IN
      SELECT c.conname, c.conrelid::regclass::text AS tbl
        FROM pg_constraint c
       WHERE c.connamespace = 'public'::regnamespace
         AND left(c.conname, length(old_prefix) + 1) = old_prefix || '_'
    LOOP
      EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I',
        r.tbl, r.conname, new_prefix || substr(r.conname, length(old_prefix) + 1));
    END LOOP;

    -- remaining plain indexes
    FOR r IN
      SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public'
         AND left(indexname, length(old_prefix) + 1) = old_prefix || '_'
    LOOP
      EXECUTE format('ALTER INDEX %I RENAME TO %I',
        r.indexname, new_prefix || substr(r.indexname, length(old_prefix) + 1));
    END LOOP;

    -- autoincrement sequences (TCZ_OPOS_DocEntry_seq etc.)
    FOR r IN
      SELECT sequencename FROM pg_sequences
       WHERE schemaname = 'public'
         AND left(sequencename, length(old_prefix) + 1) = old_prefix || '_'
    LOOP
      EXECUTE format('ALTER SEQUENCE %I RENAME TO %I',
        r.sequencename, new_prefix || substr(r.sequencename, length(old_prefix) + 1));
    END LOOP;
  END LOOP;
END $$;

-- The informational "Object" label on each row/default follows the new header name.
UPDATE "Linesales"            SET "Object" = 'Linesales' WHERE "Object" = 'TCZ_OPOS';
UPDATE "LinesaleItemDetails"  SET "Object" = 'Linesales' WHERE "Object" = 'TCZ_OPOS';
UPDATE "LinesaleOfferDetails" SET "Object" = 'Linesales' WHERE "Object" = 'TCZ_OPOS';
ALTER TABLE "Linesales"            ALTER COLUMN "Object" SET DEFAULT 'Linesales';
ALTER TABLE "LinesaleItemDetails"  ALTER COLUMN "Object" SET DEFAULT 'Linesales';
ALTER TABLE "LinesaleOfferDetails" ALTER COLUMN "Object" SET DEFAULT 'Linesales';
