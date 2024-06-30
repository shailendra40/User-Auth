/*
  Warnings:

  - Added the required column `confirmPassword` to the `UserAuthDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAuthDetails" ADD COLUMN     "confirmPassword" TEXT NOT NULL;
