/*
  Warnings:

  - The values [SELLER] on the enum `ListingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ListingType_new" AS ENUM ('RENT', 'BUY', 'COMMERCIAL');
ALTER TABLE "public"."Property" ALTER COLUMN "ListingType" TYPE "public"."ListingType_new" USING ("ListingType"::text::"public"."ListingType_new");
ALTER TYPE "public"."ListingType" RENAME TO "ListingType_old";
ALTER TYPE "public"."ListingType_new" RENAME TO "ListingType";
DROP TYPE "public"."ListingType_old";
COMMIT;
