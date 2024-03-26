import { isValidId } from "../../public/scripts/validators.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreatedMapWithRelations, Settings } from "../types";

const prisma = new PrismaClient();

export const readMap = async function (id: number): Promise<CreatedMapWithRelations | null> {
  if (!isValidId(id)) return null;
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

export const createMap = async function (day: string, title: string, description: string, settings: Settings, collection: number) {
  const result = await prisma.createdMap
    .create({
      data: {
        day: day,
        title: title,
        description: description,
        settings: settings as unknown as Prisma.InputJsonValue,
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
