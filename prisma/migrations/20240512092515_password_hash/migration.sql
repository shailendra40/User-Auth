/*
  Warnings:

  - You are about to drop the `userauthdetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "userauthdetails";

-- CreateTable
CREATE TABLE "UserAuthDetails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuthDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthDetails_email_key" ON "UserAuthDetails"("email");
