/*
  Warnings:

  - You are about to drop the `UserTester` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientSecret` to the `ClientApp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientApp" ADD COLUMN     "clientSecret" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserApplication" ADD COLUMN     "externalUserId" TEXT;

-- DropTable
DROP TABLE "UserTester";
