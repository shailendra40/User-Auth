/*
  Warnings:

  - You are about to drop the column `name` on the `UserAuthDetails` table. All the data in the column will be lost.
  - Added the required column `username` to the `UserAuthDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAuthDetails" DROP COLUMN "name",
ADD COLUMN     "username" TEXT NOT NULL;
