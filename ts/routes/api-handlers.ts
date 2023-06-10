import fs from "fs";
import { readMaps, createMap, readWorldData, createWorld, readWorld, createWorldData, updateUserRank } from "../src/queries/index.js";
import SettingsValidator from "../public/scripts/class/SettingsValidator.js";
import MapGenerator from "../public/scripts/class/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settings-codec.js";
import saveMapPng from "../src/save-map-png.js";
import parseTurnData from "../src/parse-turn-data.js";
import { Settings } from "../src/Types.js";
import { Request } from "express";
import { Prisma } from "@prisma/client";

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
  const data = await readWorldData(worldId, turn);
  if (data === null) return false;
  return data;
};
export const handleCreateMap = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 2) return false;
  const settings = req.body.settings as Settings;
  const title = req.body.title;
  const description = req.body.description;
  if (!SettingsValidator.settings(settings)) return false;
  const encodedSettings = encodeSettings(settings);
  if (typeof title !== "string" || title.length === 0 || title.length > 20) return false;
  if (typeof description !== "string" || description.length > 100) return false;
  const turnData = await readWorldData(settings.world, settings.turn);
  if (turnData === null) return false;
  const generator = new MapGenerator(turnData, settings);
  const createdMap = await createMap(settings.world, settings.turn, req.session.user.id, title, description, encodedSettings);
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
  const createdWorldData = await createWorldData(world, turn, parsedTurnData);
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
