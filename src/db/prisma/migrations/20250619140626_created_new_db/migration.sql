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
    "name" TEXT NOT NULL,
    "uniqueToken" TEXT,
    "username" TEXT,
    "avatar_url" TEXT,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "bio" TEXT,
    "twitter_username" TEXT
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
    "lateNight" TEXT NOT NULL,

    CONSTRAINT "UserDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gitStreak" (
    "unqiueToken" TEXT NOT NULL,
    "gitDate" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "level" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_id_key" ON "Streak"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_uniqueToken_key" ON "Streak"("uniqueToken");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_username_key" ON "Streak"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_id_key" ON "UserAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_uniqueToken_key" ON "UserAccount"("uniqueToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_id_key" ON "Languages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_uniqueToken_date_key" ON "UserDailyStats"("uniqueToken", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gitStreak_unqiueToken_key" ON "gitStreak"("unqiueToken");
