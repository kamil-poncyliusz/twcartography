import { Collection, PrismaClient } from "@prisma/client";
import { CollectionWithRelations } from "../Types";
import { isValidId } from "../../public/scripts/validators.js";

const prisma = new PrismaClient();

export const readCollection = async function (id: number): Promise<CollectionWithRelations | null> {
  if (!isValidId(id)) return null;
  const result = await prisma.collection
    .findUnique({
      where: {
        id: id,
      },
      include: {
        animations: true,
        author: true,
        maps: {
          orderBy: {
            turn: "asc",
          },
        },
        world: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readCollections = async function (worldId: number | undefined, authorId: number | undefined): Promise<CollectionWithRelations[]> {
  if (!(worldId === undefined || isValidId(worldId))) return [];
  const result = await prisma.collection
    .findMany({
      where: {
        worldId: worldId,
        authorId: authorId,
      },
      include: {
        animations: true,
        author: true,
        maps: true,
        world: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createCollection = async function (world: number, author: number, title: string, description: string): Promise<Collection | null> {
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

export const deleteCollection = async function (id: number): Promise<boolean> {
  const result = await prisma.collection
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

export const updateCollection = async function (id: number, data: { title?: string; description?: string; views?: number }): Promise<boolean> {
  const result = await prisma.collection
    .update({
      data: data,
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
