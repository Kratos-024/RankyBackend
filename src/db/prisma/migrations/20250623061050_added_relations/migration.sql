-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Languages" ADD CONSTRAINT "Languages_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyStats" ADD CONSTRAINT "UserDailyStats_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gitStreak" ADD CONSTRAINT "gitStreak_uniqueId_fkey" FOREIGN KEY ("uniqueId") REFERENCES "UserAccount"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
