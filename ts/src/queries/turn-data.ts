import { PrismaClient, Prisma } from "@prisma/client";
import { ParsedTurnData } from "../types";

const prisma = new PrismaClient();

export const readTurnData = async function (worldId: number, day: number): Promise<ParsedTurnData | null> {
  const result = await prisma.turnData
    .findFirst({
      where: {
        worldId: worldId,
        day: day,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  if (result !== null) {
    const parsedData = result.data as unknown as ParsedTurnData;
    return parsedData;
  }
  return null;
};

export const createTurnData = async function (worldId: number, day: number, parsedTurnData: ParsedTurnData): Promise<boolean> {
  const result = await prisma.turnData
    .create({
      data: { worldId: worldId, day: day, data: parsedTurnData as unknown as Prisma.InputJsonValue },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};

export const deleteTurnData = async function (id: number): Promise<boolean> {
  const result = await prisma.turnData
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
