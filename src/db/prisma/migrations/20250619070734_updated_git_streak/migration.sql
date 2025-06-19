-- CreateTable
CREATE TABLE "gitStreak" (
    "unqiueToken" TEXT NOT NULL,
    "gitDate" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "level" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "gitStreak_unqiueToken_key" ON "gitStreak"("unqiueToken");
