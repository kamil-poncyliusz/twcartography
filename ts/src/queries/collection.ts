import { PrismaClient, Prisma, Collection } from "@prisma/client";
import { decodeSettings } from "../../public/scripts/settings-codec.js";

const prisma = new PrismaClient();

export const readCollection = async function (id: number) {
  if (typeof id !== "number" || id <= 0) return null;
  const result = await prisma.collection
    .findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
        maps: true,
        world: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readUserCollections = async function (id: number): Promise<Collection[]> {
  if (typeof id !== "number" || id <= 0) return [];
  const result = await prisma.collection
    .findMany({
      where: {
        authorId: id,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createCollection = async function (world: number, author: number, title: string, description: string) {
  const result = await prisma.collection
    .create({
      data: {
        worldId: world,
        authorId: author,
        title: title,
        description: description,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};
