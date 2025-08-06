/*
  Warnings:

  - Added the required column `updatedAt` to the `Enquiry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Enquiry" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Enquiry_propertyId_createdAt_idx" ON "public"."Enquiry"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_userId_createdAt_idx" ON "public"."Enquiry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_parentId_idx" ON "public"."Enquiry"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Enquiry" ADD CONSTRAINT "Enquiry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
