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
  deleteCollection,
  updateCollection,
  readCollection,
} from "../src/queries/index.js";
import MapGenerator from "../public/scripts/class/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settings-codec.js";
import saveMapPng from "../src/save-map-png.js";
import parseTurnData from "../src/parse-turn-data.js";
import {
  CreateMapRequestValidationCode,
  isValidCollectionDescription,
  isValidCollectionTitle,
  isValidCreateMapRequest,
  isValidID,
  isValidTurn,
  isValidUserRank,
  isValidWorldCreatePayload,
} from "../public/scripts/validators.js";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { CreateMapRequestPayload, CreateWorldRequestPayload } from "../src/Types.js";

type mapsWithRelations = Prisma.PromiseReturnType<typeof readMaps>;

export const handleReadWorld = async function (req: Request) {
  const id = parseInt(req.params.id);
  if (!isValidID(id)) return false;
  const data = await readWorld(id);
  if (data === null) return false;
  return data;
};

export const handleReadTurnData = async function (req: Request) {
  const worldId = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (!isValidID(worldId) || isNaN(turn) || turn < 0 || turn > 365) return false;
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
  const payloadValidationCode = isValidCreateMapRequest(payload);
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

export const handleCreateWorld = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const payload: CreateWorldRequestPayload = {
    server: req.body.server,
    num: req.body.num,
    domain: req.body.domain,
    timestamp: req.body.timestamp,
  };
  if (!isValidWorldCreatePayload(req.body)) return false;
  const createdWorld = await createWorld(payload.server, payload.num, payload.domain, payload.timestamp);
  if (!createdWorld) return false;
  console.log("Stworzono świat o id", createdWorld.id);
  return createdWorld.id;
};

export const handleCreateTurnData = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const world = req.body.world;
  const turn = req.body.turn;
  if (!isValidID(world) || !isValidTurn(turn)) return false;
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
  if (!isValidID(id) || !isValidUserRank(rank)) return false;
  const success = await updateUserRank(id, rank);
  return success;
};

export const handleDeleteWorld = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.id;
  if (!isValidID(worldId)) return false;
  const isDeleted = await deleteWorld(worldId);
  return isDeleted;
};

export const handleDeleteMap = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const mapId = req.body.id;
  if (!isValidID(mapId)) return false;
  const isDeleted = await deleteMap(mapId);
  return isDeleted;
};

export const handleDeleteCollection = async function (req: Request) {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const id = req.body.id;
  if (!isValidID(id)) return false;
  const isDeleted = await deleteCollection(id);
  return isDeleted;
};

export const handleUpdateCollection = async function (req: Request) {
  const id = req.body.id;
  if (!req.session.user || !isValidID(id)) return false;
  const collection = await readCollection(id);
  if (!collection || collection.author.id !== req.session.user.id) return false;
  const title = req.body.title;
  const description = req.body.description;
  const views = req.body.views;
  if (!isValidCollectionTitle(title)) {
    const isUpdated = await updateCollection(id, { title: title });
    return isUpdated;
  } else if (!isValidCollectionDescription(description)) {
    const isUpdated = await updateCollection(id, { description: description });
    return isUpdated;
  } else if (typeof views === "number" && views >= 0) {
    const isUpdated = await updateCollection(id, { views: views });
    return isUpdated;
  }
  return false;
};
