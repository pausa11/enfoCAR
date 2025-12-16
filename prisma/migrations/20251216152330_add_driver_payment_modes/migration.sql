-- CreateEnum
CREATE TYPE "DriverPaymentMode" AS ENUM ('PERCENTAGE', 'FIXED_SALARY');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "driverPaymentMode" "DriverPaymentMode";

-- CreateTable
CREATE TABLE "DriverSalary" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverSalary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverSalary_assetId_year_month_key" ON "DriverSalary"("assetId", "year", "month");

-- AddForeignKey
ALTER TABLE "DriverSalary" ADD CONSTRAINT "DriverSalary_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
