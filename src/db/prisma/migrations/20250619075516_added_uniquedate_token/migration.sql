/*
  Warnings:

  - A unique constraint covering the columns `[uniqueToken,date]` on the table `UserDailyStats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserDailyStats" ADD CONSTRAINT "UserDailyStats_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "UserDailyStats_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_uniqueToken_date_key" ON "UserDailyStats"("uniqueToken", "date");
