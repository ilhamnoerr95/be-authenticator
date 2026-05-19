-- AlterTable
ALTER TABLE "TwoFactorSecret" ADD COLUMN     "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "UserApplication_clientAppId_externalUserId_idx" ON "UserApplication"("clientAppId", "externalUserId");
