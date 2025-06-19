-- AlterTable
ALTER TABLE "UserAccount" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "avatar_url" DROP NOT NULL;
