import { PrismaClient, World } from "@prisma/client";
import { WorldWithWorldData } from "../types";

const prisma = new PrismaClient();

export const readWorld = async function (id: number): Promise<World | null> {
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

export const readWorlds = async function (): Promise<World[]> {
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
            day: true,
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

export const createWorld = async function (serverId: number, name: string): Promise<World | null> {
  const createdWorld = await prisma.world
    .create({
      data: {
        name: name,
        serverId: serverId,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return createdWorld;
};

export const deleteWorld = async function (id: number): Promise<World | null> {
  const deletedWorld = await prisma.world
    .delete({
      where: {
        id: id,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return deletedWorld;
};
