/*
  Warnings:

  - Added the required column `ListingType` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ListingType" AS ENUM ('RENT', 'SELLER', 'COMMERCIAL');

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "ListingType" "public"."ListingType" NOT NULL;
