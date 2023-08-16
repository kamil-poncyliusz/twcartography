-- CreateTable
CREATE TABLE "CreatedMap" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(200) NOT NULL,
    "encodedSettings" TEXT NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "turn" INTEGER NOT NULL,

    CONSTRAINT "CreatedMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(15) NOT NULL,
    "password" CHAR(60) NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnData" (
    "id" SERIAL NOT NULL,
    "data" JSON NOT NULL,
    "turn" INTEGER NOT NULL,
    "worldId" INTEGER NOT NULL,

    CONSTRAINT "TurnData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "num" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "startTimestamp" INTEGER NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(500) NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "worldId" INTEGER NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatedAnimation" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,

    CONSTRAINT "CreatedAnimation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- AddForeignKey
ALTER TABLE "CreatedMap" ADD CONSTRAINT "CreatedMap_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnData" ADD CONSTRAINT "TurnData_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatedAnimation" ADD CONSTRAINT "CreatedAnimation_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
