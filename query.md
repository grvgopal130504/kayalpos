npx prisma migrate reset --force
npx prisma generate
npm run dev


DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


npx prisma migrate deploy
npm run db:seed
npx prisma generate
npm run dev