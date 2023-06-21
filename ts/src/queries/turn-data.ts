import { PrismaClient, Prisma } from "@prisma/client";
import { ParsedTurnData } from "../Types";

const prisma = new PrismaClient();

export const readTurnData = async function (worldId: number, turn: number) {
  const result = await prisma.turnData
    .findFirst({
      where: {
        worldId: worldId,
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

export const createTurnData = async function (worldId: number, turn: number, parsedTurnData: ParsedTurnData) {
  const data = parsedTurnData as unknown;
  const result = await prisma.turnData
    .create({
      data: { worldId: worldId, turn: turn, data: data as Prisma.InputJsonValue },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteTurnData = async function (id: number) {
  const result = await prisma.turnData
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
