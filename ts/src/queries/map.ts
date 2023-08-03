import { CreatedMap, PrismaClient } from "@prisma/client";
import { isValidID } from "../../public/scripts/validators.js";
import { CreatedMapWithRelations } from "../Types.js";

const prisma = new PrismaClient();

export const readMap = async function (id: number): Promise<CreatedMapWithRelations | null> {
  if (!isValidID(id)) return null;
  const result = await prisma.createdMap
    .findUnique({
      where: {
        id: id,
      },
      include: {
        collection: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const createMap = async function (turn: number, title: string, description: string, settings: string, collection: number) {
  const result = await prisma.createdMap
    .create({
      data: {
        turn: turn,
        title: title,
        description: description,
        encodedSettings: settings,
        collectionId: collection,
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

export const updateMap = async function (id: number, data: { title?: string; description?: string }): Promise<boolean> {
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
