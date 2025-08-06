/*
  Warnings:

  - You are about to drop the `_UserConversations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[propertyId,buyerId,sellerId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."MessageType" ADD VALUE 'IMAGE';
ALTER TYPE "public"."MessageType" ADD VALUE 'FILE';
ALTER TYPE "public"."MessageType" ADD VALUE 'AUDIO';
ALTER TYPE "public"."MessageType" ADD VALUE 'VIDEO';

-- DropForeignKey
ALTER TABLE "public"."_UserConversations" DROP CONSTRAINT "_UserConversations_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserConversations" DROP CONSTRAINT "_UserConversations_B_fkey";

-- DropIndex
DROP INDEX "public"."Conversation_propertyId_key";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "buyerId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "readAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."_UserConversations";

-- CreateIndex
CREATE INDEX "Conversation_buyerId_lastMessageAt_idx" ON "public"."Conversation"("buyerId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_sellerId_lastMessageAt_idx" ON "public"."Conversation"("sellerId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_propertyId_buyerId_sellerId_key" ON "public"."Conversation"("propertyId", "buyerId", "sellerId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "public"."Message"("isRead");

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
