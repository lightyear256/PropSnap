/*
  Warnings:

  - You are about to drop the column `parentId` on the `Enquiry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Enquiry" DROP CONSTRAINT "Enquiry_parentId_fkey";

-- DropIndex
DROP INDEX "public"."Enquiry_parentId_idx";

-- AlterTable
ALTER TABLE "public"."Enquiry" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "public"."EnquiryReply" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,

    CONSTRAINT "EnquiryReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnquiryReply_enquiryId_createdAt_idx" ON "public"."EnquiryReply"("enquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "EnquiryReply_userId_createdAt_idx" ON "public"."EnquiryReply"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."EnquiryReply" ADD CONSTRAINT "EnquiryReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnquiryReply" ADD CONSTRAINT "EnquiryReply_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "public"."Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
