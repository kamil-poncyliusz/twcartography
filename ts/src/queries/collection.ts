import { isValidId } from "../../public/scripts/validators.js";
import { Collection, PrismaClient } from "@prisma/client";
import { CollectionWithRelations } from "../types";

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

export const readCollections = async function (page: number, filters: { worldId: number; authorId: number }): Promise<CollectionWithRelations[]> {
  const defaultItemsPerPage = 5;
  const isPaginationEnabled = page > 0;
  const itemsPerPage = isPaginationEnabled ? defaultItemsPerPage : undefined;
  const itemsOffset = isPaginationEnabled ? (page - 1) * defaultItemsPerPage : undefined;
  const worldId = filters.worldId > 0 ? filters.worldId : undefined;
  const authorId = filters.authorId > 0 ? filters.authorId : undefined;
  const result = await prisma.collection
    .findMany({
      where: {
        worldId: worldId,
        authorId: authorId,
      },
      include: {
        animations: true,
        author: true,
        maps: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        world: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: itemsOffset,
      take: itemsPerPage,
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
