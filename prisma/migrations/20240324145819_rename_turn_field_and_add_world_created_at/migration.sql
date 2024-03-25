/*
  Warnings:

  - You are about to drop the column `turn` on the `CreatedMap` table. All the data in the column will be lost.
  - Added the required column `day` to the `CreatedMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreatedMap" DROP COLUMN "turn",
ADD COLUMN     "day" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "World" ADD COLUMN     "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
