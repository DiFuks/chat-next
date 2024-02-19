/*
  Warnings:

  - Added the required column `type` to the `Statistic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatisticType" AS ENUM ('IMAGE', 'MESSAGE');

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "type" "StatisticType" NOT NULL;
