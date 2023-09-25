/*
  Warnings:

  - You are about to drop the column `encodedSettings` on the `CreatedMap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreatedMap" DROP COLUMN "encodedSettings",
ADD COLUMN     "settings" JSON NOT NULL DEFAULT '{}';
