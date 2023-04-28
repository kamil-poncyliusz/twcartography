import express from "express";
import { readMaps, createMap } from "../src/queries/map.js";
import { readWorldData } from "../src/queries/worldData.js";
import { readWorld } from "../src/queries/world.js";
import authorization, { AuthorizedRequest } from "../src/authorization.js";
import saveMapAsPng from "../src/saveMapAsPng.js";
import SettingsValidator from "../public/scripts/SettingsValidator.js";
import MapGenerator from "../public/scripts/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settingsCodec.js";
import { ParsedTurnData, Settings, ReadMapsParameters } from "../public/scripts/Types.js";
import { Prisma } from "@prisma/client";
type mapsWithRelations = Prisma.PromiseReturnType<typeof readMaps>;

const router = express.Router();

router.get("/world/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await readWorld(id);
  return res.json(data);
});
router.get("/data/:world/:turn", async (req, res) => {
  const world = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  const data = await readWorldData(world, turn);
  return res.json(data);
});
router.post("/map/create", authorization, async (req: AuthorizedRequest, res) => {
  if (!req.authorized) return res.json(false);
  console.log(req.authorized);
  if (req.authorized.rank !== 1) return res.json(false);
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
router.get("/maps/:world/:author/:timespan/:order/:page", async (req, res) => {
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

export default router;
