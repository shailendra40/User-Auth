-- CreateTable
CREATE TABLE "userauthdetails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile" TEXT,

    CONSTRAINT "userauthdetails_pkey" PRIMARY KEY ("id")
);
