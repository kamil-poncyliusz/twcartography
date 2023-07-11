import { PrismaClient } from "@prisma/client";
import { CreatedMapWithRelations } from "../Types";
import { isValidID } from "../../public/scripts/validators.js";

const prisma = new PrismaClient();

export const readMap = async function (id: number): Promise<CreatedMapWithRelations | null> {
  if (!isValidID(id)) return null;
  const result = await prisma.createdMap
    .findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
        world: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const createMap = async function (
  worldId: number,
  turn: number,
  authorId: number,
  title: string,
  description: string,
  settings: string,
  collection: number
) {
  const result = await prisma.createdMap
    .create({
      data: {
        worldId: worldId,
        turn: turn,
        authorId: authorId,
        title: title,
        description: description,
        encodedSettings: settings,
        collectionId: collection,
        position: turn,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteMap = async function (id: number): Promise<boolean> {
  const result = await prisma.createdMap
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

export const updateMap = async function (id: number, data: { title?: string; description?: string; position?: number }): Promise<boolean> {
  const result = await prisma.createdMap
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
