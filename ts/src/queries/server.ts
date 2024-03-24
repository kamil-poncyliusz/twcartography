import { PrismaClient, Server } from "@prisma/client";
import { CreateServerRequestPayload, ServerWithWorlds } from "../types";

const prisma = new PrismaClient();

export const readServer = async function (id: number): Promise<Server | null> {
  const result = await prisma.server
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

export const readServerByName = async function (name: string): Promise<Server | null> {
  const result = await prisma.server
    .findUnique({
      where: {
        name: name,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readServerWithWorlds = async function (id: number): Promise<ServerWithWorlds | null> {
  const result = await prisma.server
    .findUnique({
      where: {
        id: id,
      },
      include: {
        worlds: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const readServers = async function (): Promise<Server[]> {
  const result = await prisma.server.findMany().catch((err) => {
    console.error("Prisma error:", err);
    return [] as Server[];
  });
  return result;
};

export const readServersWithWorlds = async function (): Promise<ServerWithWorlds[]> {
  const result = await prisma.server
    .findMany({
      include: {
        worlds: true,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createServer = async function (createServerRequestPayload: CreateServerRequestPayload): Promise<Server | null> {
  const createdWorld = await prisma.server
    .create({
      data: {
        name: createServerRequestPayload.name,
        domain: createServerRequestPayload.domain,
        updateHour: createServerRequestPayload.updateHour,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return createdWorld;
};

export const deleteServer = async function (id: number): Promise<Server | null> {
  const deletedServer = await prisma.server
    .delete({
      where: {
        id: id,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return deletedServer;
};

export const updateServer = async function (id: number, updatedFields: { updateHour: number; active: boolean }): Promise<boolean> {
  const result = await prisma.server
    .update({
      where: {
        id: id,
      },
      data: updatedFields,
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  if (result) return true;
  else return false;
};
