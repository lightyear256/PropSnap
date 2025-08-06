/*
  Warnings:

  - You are about to drop the column `isActive` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Conversation_buyerId_lastMessageAt_idx";

-- DropIndex
DROP INDEX "public"."Conversation_sellerId_lastMessageAt_idx";

-- DropIndex
DROP INDEX "public"."Message_isRead_idx";

-- AlterTable
ALTER TABLE "public"."Conversation" DROP COLUMN "isActive",
DROP COLUMN "lastMessageAt";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "isRead",
DROP COLUMN "readAt",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "Conversation_buyerId_idx" ON "public"."Conversation"("buyerId");

-- CreateIndex
CREATE INDEX "Conversation_sellerId_idx" ON "public"."Conversation"("sellerId");
