import { PrismaClient, Prisma } from "@prisma/client";
import { worlds } from "@prisma/client";

const prisma = new PrismaClient();

export const readWorld = async function (id: number) {
  const result = await prisma.worlds
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
  const result = await prisma.worlds.findMany().catch((err) => {
    console.error("Prisma error:", err);
    return [] as worlds[];
  });
  return result;
};

export const createWorld = async function (server: string, num: string, domain: string) {
  const result = await prisma.worlds
    .create({
      data: {
        server: server,
        num: num,
        domain: domain,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteWorld = async function (id: number) {
  const result = await prisma.worlds
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
