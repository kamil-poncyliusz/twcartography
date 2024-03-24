/*
  Warnings:

  - You are about to drop the column `turn` on the `TurnData` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `World` table. All the data in the column will be lost.
  - You are about to drop the column `endTimestamp` on the `World` table. All the data in the column will be lost.
  - You are about to drop the column `num` on the `World` table. All the data in the column will be lost.
  - You are about to drop the column `server` on the `World` table. All the data in the column will be lost.
  - You are about to drop the column `startTimestamp` on the `World` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `World` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `TurnData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `World` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverId` to the `World` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TurnData" DROP COLUMN "turn",
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "World" DROP COLUMN "domain",
DROP COLUMN "endTimestamp",
DROP COLUMN "num",
DROP COLUMN "server",
DROP COLUMN "startTimestamp",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "serverId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "updateHour" INTEGER NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_name_key" ON "Server"("name");

-- CreateIndex
CREATE UNIQUE INDEX "World_name_key" ON "World"("name");

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
