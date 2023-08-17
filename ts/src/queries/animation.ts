import { CreatedAnimation, PrismaClient } from "@prisma/client";
import { isValidID } from "../../public/scripts/validators.js";

const prisma = new PrismaClient();

export const readAnimation = async function (id: number): Promise<CreatedAnimation | null> {
  if (!isValidID(id)) return null;
  const result = await prisma.createdAnimation
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

export const createAnimation = async function (collectionID: number): Promise<CreatedAnimation | null> {
  if (!isValidID(collectionID)) return null;
  const result = await prisma.createdAnimation
    .create({
      data: {
        collectionId: collectionID,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteAnimation = async function (collectionID: number): Promise<boolean> {
  if (!isValidID(collectionID)) return false;
  const result = await prisma.createdAnimation
    .delete({
      where: {
        id: collectionID,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};
