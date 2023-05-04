import { PrismaClient, Prisma } from "@prisma/client";
import { ParsedTurnData } from "../../public/scripts/Types";

const prisma = new PrismaClient();

export const readWorldData = async function (worldId: number, turn: number) {
  const result = await prisma.worldData
    .findFirst({
      where: {
        world_id: worldId,
        turn: turn,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  if (result !== null) {
    const parsedData = result.data as unknown;
    return parsedData as ParsedTurnData;
  }
  return null;
};

export const createWorldData = async function (worldId: number, turn: number, data: Prisma.InputJsonValue) {
  const result = await prisma.worldData
    .create({
      data: { world_id: worldId, turn: turn, data: data },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteWorldData = async function (id: number) {
  const result = await prisma.worldData
    .delete({
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