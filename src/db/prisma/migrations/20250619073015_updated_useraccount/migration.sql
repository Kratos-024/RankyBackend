/*
  Warnings:

  - A unique constraint covering the columns `[uniqueToken]` on the table `Streak` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Streak` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uniqueToken]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `UserAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniqueToken` to the `UserAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAccount" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "uniqueToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Streak_uniqueToken_key" ON "Streak"("uniqueToken");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_username_key" ON "Streak"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_uniqueToken_key" ON "UserAccount"("uniqueToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");
