/*
  Warnings:

  - Added the required column `description` to the `PropertyImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PropertyImage" ADD COLUMN     "description" TEXT NOT NULL;
