import express from "express";
import { Prisma } from "@prisma/client";
import { readMaps, createMap, readWorldData, createWorld, readWorld } from "../src/queries/index.js";
import saveMapAsPng from "../src/saveMapAsPng.js";
import SettingsValidator from "../public/scripts/SettingsValidator.js";
import MapGenerator from "../public/scripts/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settingsCodec.js";
import { ParsedTurnData, Settings, ReadMapsParameters, AuthorizedRequest } from "../public/scripts/Types.js";

type mapsWithRelations = Prisma.PromiseReturnType<typeof readMaps>;

const api = express.Router();

const validateWorldCreateBody = function (row: any) {
  if (!row.server || typeof row.server !== "string" || row.server === "") return false;
  if (!row.num || typeof row.num !== "string" || row.num === "") return false;
  if (!row.domain || typeof row.domain !== "string" || row.domain === "") return false;
  if (!row.timestamp || typeof row.timestamp !== "number" || row.timestamp <= 0) return false;
  return true;
};

api.get("/world/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await readWorld(id);
  return res.json(data);
});
api.get("/data/:world/:turn", async (req, res) => {
  const world = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  const data = await readWorldData(world, turn);
  return res.json(data);
});
api.post("/map/create", async (req: AuthorizedRequest, res) => {
  if (!req.authorized) return res.json(false);
  if (req.authorized.rank === 0) return res.json(false);
  const settings = req.body as Settings;
  if (!SettingsValidator.settings(settings)) return res.json(false);
  const encodedSettings = encodeSettings(settings);
  const result = (await readWorldData(settings.world, settings.turn)) as unknown;
  if (!result) return res.json(false);
  const worldData = result as ParsedTurnData;
  const generator = new MapGenerator(worldData, settings);
  const imageData = generator.imageData;
  const createdMap = await createMap(
    settings.world,
    settings.turn,
    req.authorized.id,
    "tytuł",
    "opis",
    encodedSettings
  );
  if (!createdMap) return res.json(false);
  const saved = await saveMapAsPng(createdMap.id, imageData as ImageData);
  if (saved) {
    return res.json(true);
  } else {
    return res.json(false);
  }
});
api.get("/maps/:world/:author/:timespan/:order/:page", async (req, res) => {
  const world = parseInt(req.params.world);
  const author = parseInt(req.params.author);
  const page = parseInt(req.params.page);
  const timespans = ["day", "week", "month", "any"];
  const orders = ["newest", "oldest", "views"];
  if (world < 0 || author < 0 || page < 1) return res.json([]);
  if (!timespans.includes(req.params.timespan)) return res.json([]);
  if (!orders.includes(req.params.order)) return res.json([]);
  const params = {
    author: author,
    order: req.params.order,
    timespan: req.params.timespan,
    world: world,
  } as ReadMapsParameters;
  const maps = await readMaps(page, params);
  return res.json(maps);
});
api.post("/world/create", async (req: AuthorizedRequest, res) => {
  console.log("create world request...");
  if (!req.authorized) return res.json({});
  if (req.authorized.rank !== 2) return res.json({});
  if (!validateWorldCreateBody(req.body)) return res.json({});
  const server: string = req.body.server;
  const num: string = req.body.num;
  const domain: string = req.body.domain;
  const timestamp: number = req.body.timestamp;
  const createdWorld = await createWorld(server, num, domain, timestamp);
  if (!createdWorld) return res.json({});
  console.log("Stworzono świat o id", createdWorld.id);
  return res.json(createdWorld);
});

export default api;
