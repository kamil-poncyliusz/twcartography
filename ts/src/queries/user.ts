import bcrypt from "bcryptjs";
import { PrismaClient, User } from "@prisma/client";
import { UserWithRelations } from "../types";

const prisma = new PrismaClient();

export const readUser = async function (id: number): Promise<UserWithRelations | null> {
  const result = await prisma.user
    .findUnique({
      where: {
        id: id,
      },
      include: {
        collections: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readUserByLogin = async function (login: string): Promise<User | null | undefined> {
  const result = await prisma.user
    .findUnique({
      where: {
        login: login,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return undefined;
    });
  return result;
};

export const readUsers = async function (): Promise<User[]> {
  const result = await prisma.user
    .findMany({
      orderBy: {
        id: "asc",
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createUser = async function (login: string, password: string, rank: number): Promise<boolean> {
  const result = await prisma.user
    .create({
      data: {
        login: login,
        password: password,
        rank: rank,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};

export const deleteUser = async function (id: number): Promise<boolean> {
  const result = await prisma.user
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

export const deleteAllUsers = async function (): Promise<boolean> {
  const result = await prisma.user.deleteMany({}).catch((err) => {
    console.error("Prisma error:", err);
    return false;
  });
  return true;
};

export const updateUser = async function (id: number, updatedFields: { rank?: number; password?: string }): Promise<boolean> {
  const user = await prisma.user
    .update({
      where: {
        id: id,
      },
      data: updatedFields,
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  if (user) return true;
  else return false;
};

export const upsertAdminAccount = async function (login: string, password: string): Promise<boolean> {
  const hash = bcrypt.hashSync(password, 5);
  const result = await prisma.user
    .upsert({
      where: {
        login: login,
      },
      update: {
        password: hash,
        rank: 10,
      },
      create: {
        login: login,
        password: hash,
        rank: 10,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return false;
    });
  return true;
};
