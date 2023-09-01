import { promises as fs } from "fs";
import {
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
  readMap,
  updateMap,
  createAnimation,
  deleteAnimation,
  readAnimation,
} from "../src/queries/index.js";
import MapGenerator from "../public/scripts/class/MapGenerator.js";
import { encodeSettings } from "../public/scripts/settings-codec.js";
import saveMapPng from "../src/save-map-png.js";
import parseTurnData from "../src/parse-turn-data.js";
import {
  CreateMapRequestValidationCode,
  isValidCollectionDescription,
  isValidCreateMapRequestPayload,
  isValidId,
  isValidMapDescription,
  isValidTitle,
  isValidTurn,
  isValidUserRank,
  isValidCreateWorldRequestPayload,
  isValidFrameDelay,
} from "../public/scripts/validators.js";
import { World } from "@prisma/client";
import { Request } from "express";
import { CreateMapRequestPayload, CreateWorldRequestPayload, ParsedTurnData } from "../src/Types.js";
import saveAnimationGif from "../src/save-animation-gif.js";
import turnDataDownloaderDaemon from "../src/turn-data-downloader-daemon.js";

interface CreateMapResponse {
  success: boolean;
  newCollection?: {
    id: number;
    title: string;
  };
}

const createWorldDirectory = async function (payload: CreateWorldRequestPayload): Promise<boolean> {
  const worldDirectoryName = payload.timestamp.toString(36);
  const worldDirectoryPath = `${process.env.ROOT}/temp/${worldDirectoryName}`;
  const worldDirectoryInfoFilePath = `${worldDirectoryPath}/info`;
  const fileString = Object.entries(payload)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  try {
    await fs.mkdir(worldDirectoryPath, { recursive: true });
  } catch (error) {
    console.log(error);
  }
  try {
    await fs.access(worldDirectoryInfoFilePath);
    await fs.unlink(worldDirectoryInfoFilePath);
  } catch (error) {
    //
  }
  try {
    await fs.writeFile(worldDirectoryInfoFilePath, fileString);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const deleteWorldDirectory = async function (worldDirectoryName: string) {
  const pathToDelete = `temp/${worldDirectoryName}`;
  try {
    await fs.access(pathToDelete);
    await fs.rm(pathToDelete, { recursive: true, force: true });
  } catch (error) {
    console.log(error);
  }
};

export const handleReadWorld = async function (req: Request): Promise<World | null> {
  const id = parseInt(req.params.id);
  if (!isValidId(id)) return null;
  const data = await readWorld(id);
  return data;
};

export const handleReadTurnData = async function (req: Request): Promise<ParsedTurnData | null> {
  const worldId = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (!isValidId(worldId) || !isValidTurn(turn)) return null;
  const data = await readTurnData(worldId, turn);
  if (data === null) return null;
  return data;
};

export const handleCreateMap = async function (req: Request): Promise<CreateMapResponse> {
  if (!req.session.user || req.session.user.rank < 2) return { success: false };
  const authorId = req.session.user.id;
  const newMapPayload: CreateMapRequestPayload = {
    settings: req.body.settings,
    title: req.body.title,
    description: req.body.description,
    collection: req.body.collection,
  };
  const settings = newMapPayload.settings;
  const encodedSettings = encodeSettings(settings);
  const payloadValidationCode = isValidCreateMapRequestPayload(newMapPayload);
  if (payloadValidationCode !== CreateMapRequestValidationCode.Ok) return { success: false };
  const turnData = await readTurnData(settings.world, settings.turn);
  if (turnData === null) return { success: false };
  const generator = new MapGenerator(turnData, settings);
  const collectionExists = newMapPayload.collection > 0;
  const newCollectionTitle = `Nowa kolekcja ${req.session.user.login}`;
  if (!collectionExists) {
    const createdCollection = await createCollection(settings.world, authorId, newCollectionTitle, "bez opisu");
    if (!createdCollection) return { success: false };
    newMapPayload.collection = createdCollection.id;
  }
  const createdMap = await createMap(settings.turn, newMapPayload.title, newMapPayload.description, encodedSettings, newMapPayload.collection);
  if (!createdMap) return { success: false };
  saveMapPng(createdMap.id, generator.imageData as ImageData);
  if (collectionExists) return { success: true };
  else return { success: true, newCollection: { id: newMapPayload.collection, title: newCollectionTitle } };
};

export const handleCreateWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  if (!isValidCreateWorldRequestPayload(req.body)) return false;
  const modifiedTimestamp: number = req.body.timestamp + Math.floor(Math.random() * 100);
  const payload: CreateWorldRequestPayload = {
    server: req.body.server,
    num: req.body.num,
    domain: req.body.domain,
    timestamp: modifiedTimestamp,
  };
  const createdWorld = await createWorld(payload.server, payload.num, payload.domain, payload.timestamp);
  if (!createdWorld) return false;
  const isWorldDirectoryCreated = await createWorldDirectory(payload);
  if (isWorldDirectoryCreated) {
    turnDataDownloaderDaemon.startDownloading(createdWorld);
    console.log("World created");
  }
  return isWorldDirectoryCreated;
};

export const handleCreateTurnData = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.world as number;
  const turn = req.body.turn as number;
  if (!isValidId(worldId) || !isValidTurn(turn)) return false;
  const world = await readWorld(worldId);
  if (!world) return false;
  const worldDirectoryName = world.startTimestamp.toString(36);
  const worldDataFilesPath = `temp/${worldDirectoryName}/${turn}`;
  try {
    await fs.access(worldDataFilesPath);
  } catch (error) {
    console.log(error);
    return false;
  }
  const parsedTurnData = await parseTurnData(worldDirectoryName, turn);
  const createdWorldData = await createTurnData(world.id, turn, parsedTurnData);
  if (!createdWorldData) return false;
  return true;
};

export const handleUpdateUserRank = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const id = req.body.id;
  const rank = req.body.rank;
  if (!isValidId(id) || !isValidUserRank(rank)) return false;
  const success = await updateUserRank(id, rank);
  return success;
};

export const handleDeleteWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.id;
  if (!isValidId(worldId)) return false;
  const deletedWorld = await deleteWorld(worldId);
  if (!deletedWorld) return false;
  const worldDirectoryName = deletedWorld.startTimestamp.toString(36);
  turnDataDownloaderDaemon.stopDownloading(deletedWorld);
  deleteWorldDirectory(worldDirectoryName);
  return true;
};

export const handleDeleteMap = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 1) return false;
  const userId = req.session.user.id;
  const mapId = req.body.id;
  if (!isValidId(mapId)) return false;
  const map = await readMap(mapId);
  if (!map) return false;
  if (map.collection.authorId !== userId) return false;
  const isDeleted = await deleteMap(mapId);
  return isDeleted;
};

export const handleDeleteCollection = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 1) return false;
  const userId = req.session.user.id;
  const collectionId = req.body.id;
  if (!isValidId(collectionId)) return false;
  const collection = await readCollection(collectionId);
  if (!collection) return false;
  if (collection.authorId !== userId) return false;
  const isDeleted = await deleteCollection(collectionId);
  return isDeleted;
};

export const handleUpdateCollection = async function (req: Request): Promise<boolean> {
  const id = req.body.id;
  if (!req.session.user || !isValidId(id)) return false;
  const collection = await readCollection(id);
  if (!collection || collection.author.id !== req.session.user.id) return false;
  const title = req.body.title;
  const description = req.body.description;
  const views = req.body.views;
  if (isValidTitle(title)) {
    const isUpdated = await updateCollection(id, { title: title });
    return isUpdated;
  } else if (isValidCollectionDescription(description)) {
    const isUpdated = await updateCollection(id, { description: description });
    return isUpdated;
  } else if (typeof views === "number" && views >= 0) {
    const isUpdated = await updateCollection(id, { views: views });
    return isUpdated;
  }
  return false;
};

export const handleUpdateMap = async function (req: Request): Promise<boolean> {
  const id = req.body.id;
  if (!req.session.user || !isValidId(id)) return false;
  const map = await readMap(id);
  if (!map || map.collection.authorId !== req.session.user.id) return false;
  const title = req.body.title;
  const description = req.body.description;
  const position = req.body.position;
  if (isValidTitle(title)) {
    const isUpdated = await updateMap(id, { title: title });
    return isUpdated;
  } else if (isValidMapDescription(description)) {
    const isUpdated = await updateMap(id, { description: description });
    return isUpdated;
  }
  return false;
};

export const handleCreateAnimation = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 2) return false;
  const authorId = req.session.user.id;
  const collectionId = req.body.collectionId as number;
  const frames = req.body.frames as number[];
  const frameDelay = req.body.frameDelay as number;
  if (!isValidId(collectionId) || !isValidFrameDelay(frameDelay) || !Array.isArray(frames)) return false;
  const collection = await readCollection(collectionId);
  if (!collection || authorId !== collection.authorId) return false;
  const collectionMapsIds = collection.maps.map((map) => map.id);
  for (let frame of frames) {
    if (!isValidId(frame)) return false;
    if (!collectionMapsIds.includes(frame)) return false;
  }
  const animationRecord = await createAnimation(collectionId);
  if (animationRecord === null) return false;
  const isGifSaved = await saveAnimationGif(animationRecord.id, frames, frameDelay);
  return true;
};

export const handleDeleteAnimation = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 1) return false;
  const userId = req.session.user.id;
  const animationId = req.body.id;
  if (!isValidId(animationId)) return false;
  const animation = await readAnimation(animationId);
  if (!animation) return false;
  if (animation.collection.authorId !== userId) return false;
  const isDeleted = await deleteAnimation(animationId);
  return isDeleted;
};
