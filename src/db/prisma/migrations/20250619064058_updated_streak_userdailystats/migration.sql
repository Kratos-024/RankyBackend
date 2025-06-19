-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "uniqueToken" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "streak" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Languages" (
    "id" TEXT NOT NULL,
    "language" TEXT[]
);

-- CreateTable
CREATE TABLE "UserDailyStats" (
    "id" TEXT NOT NULL,
    "uniqueToken" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalTimeSeconds" DECIMAL(65,30) NOT NULL,
    "totalTimeMinutes" DECIMAL(65,30) NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "totalLines" INTEGER NOT NULL,
    "languages" TEXT[],
    "earlyMorning" TEXT NOT NULL,
    "lateNight" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_id_key" ON "Streak"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_id_key" ON "UserAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_id_key" ON "Languages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_id_key" ON "UserDailyStats"("id");
