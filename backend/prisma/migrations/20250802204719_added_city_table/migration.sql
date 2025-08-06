/*
  Warnings:

  - You are about to drop the column `city` on the `Property` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "public"."City"("name");

-- CreateIndex
CREATE INDEX "City_name_state_idx" ON "public"."City"("name", "state");

-- CreateIndex
CREATE INDEX "City_isActive_idx" ON "public"."City"("isActive");

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
