-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedAssetOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false;
