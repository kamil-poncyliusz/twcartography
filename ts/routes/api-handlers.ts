import fs from "fs";
import {
  readMaps,
  createMap,
  readTurnData,
  createWorld,
  readWorld,
  createTurnData,
  updateUserRank,
  deleteWorld,
  deleteMap,
  createCollection,
} from "../src/queries/index.js";
import MapGenerator from "../public/scripts/class/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settings-codec.js";
import saveMapPng from "../src/save-map-png.js";
import parseTurnData from "../src/parse-turn-data.js";
import { CreateMapRequestPayload } from "../src/Types.js";
import { Request } from "express";
import { Prisma } from "@prisma/client";
import { CreateMapRequestValidationCode, validateCreateMapRequest } from "../public/scripts/requestValidators.js";

type mapsWithRelations = Prisma.PromiseReturnType<typeof readMaps>;

const isWorldCreateBodyValid = function (row: any) {
  if (!row.server || typeof row.server !== "string" || row.server === "") return false;
  if (!row.num || typeof row.num !== "string" || row.num === "") return false;
  if (!row.domain || typeof row.domain !== "string" || row.domain === "") return false;
  if (!row.timestamp || typeof row.timestamp !== "number" || row.timestamp <= 0) return false;
  return true;
};

export const handleReadWorld = async function (req: Request) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) return false;
  const data = await readWorld(id);
  if (data === null) return false;
  return data;
};
export const handleReadTurnData = async function (req: Request) {
  const worldId = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (isNaN(worldId) || isNaN(turn) || worldId < 1 || turn < 0 || turn > 365) return false;
  const data = await readTurnData(worldId, turn);
  if (data === null) return false;
  return data;
};
export const handleCreateMap = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 2) return false;
  const authorId = req.session.user.id;
  const payload: CreateMapRequestPayload = {
    settings: req.body.settings,
    title: req.body.title,
    description: req.body.description,
    collection: req.body.collection,
  };
  const settings = payload.settings;
  const encodedSettings = encodeSettings(settings);
  const payloadValidationCode = validateCreateMapRequest(payload);
  if (payloadValidationCode !== CreateMapRequestValidationCode.Ok) return false;
  const turnData = await readTurnData(settings.world, settings.turn);
  if (turnData === null) return false;
  const generator = new MapGenerator(turnData, settings);
  if (payload.collection === 0) {
    const createdCollection = await createCollection(settings.world, authorId, "Nowa kolekcja", "");
    if (!createdCollection) return false;
    payload.collection = createdCollection.id;
  }
  const createdMap = await createMap(
    settings.world,
    settings.turn,
    authorId,
    payload.title,
    payload.description,
    encodedSettings,
    payload.collection
  );
  if (!createdMap) return false;
  const saved = await saveMapPng(createdMap.id, generator.imageData as ImageData);
  if (!saved) return false;
  return createdMap.id;
};
export const handleReadMaps = async function (req: Request) {
  const world = parseInt(req.params.world);
  const author = parseInt(req.params.author);
  const page = parseInt(req.params.page);
  const timespans = ["day", "week", "month", "any"];
  const orders = ["newest", "oldest", "views"];
  if (!(world >= 0 && author >= 0 && page >= 1)) return [];
  if (!timespans.includes(req.params.timespan)) return [];
  if (!orders.includes(req.params.order)) return [];
  const maps = await readMaps(page, author, req.params.order, req.params.timespan, world);
  return maps;
};
export const handleCreateWorld = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  if (!isWorldCreateBodyValid(req.body)) return false;
  const server = req.body.server as string;
  const num = req.body.num as string;
  const domain = req.body.domain as string;
  const timestamp = req.body.timestamp as number;
  const createdWorld = await createWorld(server, num, domain, timestamp);
  if (!createdWorld) return false;
  console.log("Stworzono świat o id", createdWorld.id);
  return createdWorld.id;
};
export const handleCreateTurnData = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const world = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (isNaN(world) || isNaN(turn) || world < 1 || turn < 0 || turn > 365) return false;
  const worldDataFilesPath = `temp/${world}/${turn}`;
  if (!fs.existsSync(worldDataFilesPath)) return false;
  const parsedTurnData = parseTurnData(world, turn);
  const createdWorldData = await createTurnData(world, turn, parsedTurnData);
  if (!createdWorldData) return false;
  return true;
};
export const handleUpdateUserRank = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const id = req.body.id;
  const rank = req.body.rank;
  if (typeof id !== "number" || id <= 0 || typeof rank !== "number" || rank < 0) return false;
  const success = await updateUserRank(id, rank);
  return success;
};
export const handleDeleteWorld = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.id;
  if (typeof worldId !== "number" || isNaN(worldId) || worldId < 1) return false;
  const isDeleted = await deleteWorld(worldId);
  return isDeleted;
};
export const handleDeleteMap = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const mapId = req.body.id;
  if (typeof mapId !== "number" || isNaN(mapId) || mapId < 1) return false;
  const isDeleted = await deleteMap(mapId);
  return isDeleted;
};
