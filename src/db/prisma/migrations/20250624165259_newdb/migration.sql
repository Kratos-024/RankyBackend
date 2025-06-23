-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "streak" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "uniqueId" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "bio" TEXT,
    "twitter_username" TEXT
);

-- CreateTable
CREATE TABLE "UserDailyStats" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalTimeMinutes" DECIMAL(65,30) NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "totalLines" INTEGER NOT NULL,
    "languages" TEXT[],
    "earlyMorning" TEXT NOT NULL,
    "lateNight" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "UserDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gitStreak" (
    "id" TEXT,
    "uniqueId" TEXT NOT NULL,
    "gitDate" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "level" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Languages" (
    "id" TEXT NOT NULL,
    "language" TEXT[],
    "uniqueId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_id_key" ON "Streak"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_uniqueId_key" ON "Streak"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_id_key" ON "UserAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_uniqueId_key" ON "UserAccount"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_uniqueId_date_key" ON "UserDailyStats"("uniqueId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gitStreak_gitDate_uniqueId_key" ON "gitStreak"("gitDate", "uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_id_key" ON "Languages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_uniqueId_key" ON "Languages"("uniqueId");

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyStats" ADD CONSTRAINT "UserDailyStats_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gitStreak" ADD CONSTRAINT "gitStreak_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Languages" ADD CONSTRAINT "Languages_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
