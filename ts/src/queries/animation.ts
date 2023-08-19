import { CreatedAnimation, PrismaClient } from "@prisma/client";
import { isValidId } from "../../public/scripts/validators.js";
import { CreatedAnimationWithRelations } from "../Types.js";

const prisma = new PrismaClient();

export const readAnimation = async function (id: number): Promise<CreatedAnimationWithRelations | null> {
  if (!isValidId(id)) return null;
  const result = await prisma.createdAnimation
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

export const createAnimation = async function (collectionId: number): Promise<CreatedAnimation | null> {
  if (!isValidId(collectionId)) return null;
  const result = await prisma.createdAnimation
    .create({
      data: {
        collectionId: collectionId,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteAnimation = async function (collectionId: number): Promise<boolean> {
  if (!isValidId(collectionId)) return false;
  const result = await prisma.createdAnimation
    .delete({
      where: {
        id: collectionId,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};
