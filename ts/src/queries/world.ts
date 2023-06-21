import { PrismaClient, World } from "@prisma/client";
import { WorldWithWorldData } from "../Types";

const prisma = new PrismaClient();

export const readWorld = async function (id: number) {
  const result = await prisma.world
    .findUnique({
      where: {
        id: id,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readWorlds = async function () {
  const result = await prisma.world.findMany().catch((err) => {
    console.error("Prisma error:", err);
    return [] as World[];
  });
  return result;
};

export const readWorldsWithWorldData = async function (): Promise<WorldWithWorldData[]> {
  const result = await prisma.world
    .findMany({
      include: {
        worldData: {
          select: {
            id: true,
            turn: true,
          },
        },
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createWorld = async function (server: string, num: string, domain: string, startTimestamp: number) {
  const result = await prisma.world
    .create({
      data: {
        server: server,
        num: num,
        domain: domain,
        startTimestamp: startTimestamp,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteWorld = async function (id: number) {
  const result = await prisma.world
    .delete({
      where: {
        id: id,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};
