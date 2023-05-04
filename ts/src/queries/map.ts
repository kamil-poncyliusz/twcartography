import { PrismaClient, Prisma } from "@prisma/client";
import { ReadMapsParameters } from "../../public/scripts/Types";

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

export const readMaps = async function (page: number, filters: ReadMapsParameters) {
  const mapsPerPage = 5;
  const now = Date.now();
  let timespan: string | undefined;
  if (filters.author === 0) filters.author = undefined;
  if (filters.world === 0) filters.world = undefined;
  switch (filters.timespan) {
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
  const newest: Prisma.Created_mapOrderByWithRelationInput = {
    created_at: "desc",
  };
  const oldest: Prisma.Created_mapOrderByWithRelationInput = {
    created_at: "asc",
  };
  const views: Prisma.Created_mapOrderByWithRelationInput = {
    views: "desc",
  };
  const order = {
    newest: newest,
    oldest: oldest,
    views: views,
  };

  const result = await prisma.created_map
    .findMany({
      where: {
        author_id: filters.author,
        world_id: filters.world,
        created_at: {
          gte: timespan,
        },
      },
      include: {
        author: true,
        world: true,
      },
      orderBy: order[filters.order],
      skip: mapsPerPage * (page - 1),
      take: mapsPerPage,
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
  settings: string
) {
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
