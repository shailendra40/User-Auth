/*
  Warnings:

  - You are about to drop the column `confirmPassword` on the `UserAuthDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAuthDetails" DROP COLUMN "confirmPassword";
