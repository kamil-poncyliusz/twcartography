import { PrismaClient, Prisma } from "@prisma/client";
import { ParsedTurnData } from "../../public/scripts/Types";

const prisma = new PrismaClient();

export const readWorldData = async function (world: number, turn: number) {
  const result = await prisma.world_data
    .findFirst({
      where: {
        world_id: world,
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

export const createWorldData = async function (world_id: number, turn: number, data: Prisma.InputJsonValue) {
  const result = await prisma.world_data
    .create({
      data: { world_id: world_id, turn: turn, data: data },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteWorldData = async function (id: number) {
  const result = await prisma.world_data
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
