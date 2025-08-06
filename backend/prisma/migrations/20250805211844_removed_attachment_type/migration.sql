/*
  Warnings:

  - The values [IMAGE,FILE,AUDIO,VIDEO] on the enum `MessageType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attachmentType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentUrl` on the `Message` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MessageType_new" AS ENUM ('TEXT');
ALTER TABLE "public"."Message" ALTER COLUMN "messageType" DROP DEFAULT;
ALTER TABLE "public"."Message" ALTER COLUMN "messageType" TYPE "public"."MessageType_new" USING ("messageType"::text::"public"."MessageType_new");
ALTER TYPE "public"."MessageType" RENAME TO "MessageType_old";
ALTER TYPE "public"."MessageType_new" RENAME TO "MessageType";
DROP TYPE "public"."MessageType_old";
ALTER TABLE "public"."Message" ALTER COLUMN "messageType" SET DEFAULT 'TEXT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "attachmentType",
DROP COLUMN "attachmentUrl";
