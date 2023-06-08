import { PrismaClient, Prisma } from "@prisma/client";
import { Created_mapWithRelations } from "../../Types";

const prisma = new PrismaClient();

export const readMap = async function (id: number) {
  if (typeof id !== "number" || id <= 0) return null;
  const result = await prisma.created_map
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

export const readMaps = async function (
  page: number,
  author: number | undefined,
  order: string,
  timespan: string | undefined,
  world: number | undefined
): Promise<Created_mapWithRelations[]> {
  const mapsPerPage = 5;
  const now = Date.now();
  if (author === 0) author = undefined;
  if (world === 0) world = undefined;
  switch (timespan) {
    case "day":
      timespan = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      break;
    case "week":
      timespan = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "month":
      timespan = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "any":
      timespan = undefined;
  }
  const orders: { [key: string]: Prisma.Created_mapOrderByWithRelationInput } = {
    newest: {
      created_at: "desc",
    },
    oldest: {
      created_at: "asc",
    },
    views: {
      views: "desc",
    },
  };

  const result = await prisma.created_map
    .findMany({
      where: {
        author_id: author,
        world_id: world,
        created_at: {
          gte: timespan,
        },
      },
      include: {
        author: true,
        world: true,
      },
      orderBy: orders[order],
      skip: mapsPerPage * (page - 1),
      take: mapsPerPage,
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return [];
    });
  return result;
};

export const createMap = async function (worldId: number, turn: number, authorId: number, title: string, description: string, settings: string) {
  const result = await prisma.created_map
    .create({
      data: {
        world_id: worldId,
        turn: turn,
        author_id: authorId,
        title: title,
        description: description,
        settings: settings,
      },
    })
    .catch((err) => {
      console.error("Prisma error:", err);
      return null;
    });
  return result;
};

export const deleteMap = async function (id: number) {
  const result = await prisma.created_map
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
