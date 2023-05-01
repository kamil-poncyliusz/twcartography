import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const readUser = async function (id: number) {
  const result = await prisma.users
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

export const readUserByLogin = async function (login: string) {
  const result = await prisma.users
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

export const readUsers = async function () {
  const result = await prisma.users.findMany({}).catch((err) => {
    console.error("Prisma error:", err);
    return null;
  });
  return result;
};

export const createUser = async function (login: string, password: string, rank: number) {
  const result = await prisma.users
    .create({
      data: {
        login: login,
        password: password,
        rank: rank,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteUser = async function (id: number) {
  const result = await prisma.users
    .delete({
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
