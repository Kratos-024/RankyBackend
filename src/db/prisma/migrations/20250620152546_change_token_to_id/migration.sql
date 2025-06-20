/*
  Warnings:

  - You are about to drop the column `uniqueToken` on the `Streak` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueToken` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueToken` on the `UserDailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `unqiueToken` on the `gitStreak` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueId]` on the table `Languages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniqueId]` on the table `Streak` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniqueId]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniqueId,date]` on the table `UserDailyStats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniqueId]` on the table `gitStreak` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueId` to the `Languages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueId` to the `Streak` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `UserDailyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueId` to the `UserDailyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `UserDailyStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueId` to the `gitStreak` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Streak_uniqueToken_key";

-- DropIndex
DROP INDEX "UserAccount_uniqueToken_key";

-- DropIndex
DROP INDEX "UserDailyStats_uniqueToken_date_key";

-- DropIndex
DROP INDEX "gitStreak_unqiueToken_key";

-- AlterTable
ALTER TABLE "Languages" ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Streak" DROP COLUMN "uniqueToken",
ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserAccount" DROP COLUMN "uniqueToken",
ADD COLUMN     "uniqueId" TEXT;

-- AlterTable
ALTER TABLE "UserDailyStats" DROP COLUMN "uniqueToken",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "uniqueId" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "gitStreak" DROP COLUMN "unqiueToken",
ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Languages_uniqueId_key" ON "Languages"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_uniqueId_key" ON "Streak"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_uniqueId_key" ON "UserAccount"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_uniqueId_date_key" ON "UserDailyStats"("uniqueId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gitStreak_uniqueId_key" ON "gitStreak"("uniqueId");
