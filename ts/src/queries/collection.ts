import { Collection, PrismaClient } from "@prisma/client";
import { CollectionWithRelations } from "../Types";
import { isValidID } from "../../public/scripts/validators.js";

const prisma = new PrismaClient();

export const readCollection = async function (id: number): Promise<CollectionWithRelations | null> {
  if (!isValidID(id)) return null;
  const result = await prisma.collection
    .findUnique({
      where: {
        id: id,
      },
      include: {
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

export const readCollections = async function (worldID: number | undefined, authorID: number | undefined): Promise<CollectionWithRelations[]> {
  if (!(worldID === undefined || isValidID(worldID))) return [];
  const result = await prisma.collection
    .findMany({
      where: {
        worldId: worldID,
        authorId: authorID,
      },
      include: {
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
