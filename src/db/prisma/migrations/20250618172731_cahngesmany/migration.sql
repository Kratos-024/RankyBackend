/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `UserDailyStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_date_key" ON "UserDailyStats"("date");
