/*
  Warnings:

  - The `profileImg` column on the `UserAuthDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserAuthDetails" DROP COLUMN "profileImg",
ADD COLUMN     "profileImg" TEXT[];
