-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_userId_fkey";

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuthDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
