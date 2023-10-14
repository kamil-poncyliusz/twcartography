import { Request } from "express";
import { CreateMapRequestValidationCode, isValidCreateMapRequestPayload } from "../../public/scripts/requests-validators.js";
import MapGenerator from "../../public/scripts/class/map-generator.js";
import { createCollection } from "../../src/queries/collection.js";
import { createMap, deleteMap, readMap, updateMap } from "../../src/queries/map.js";
import { readTurnData } from "../../src/queries/turn-data.js";
import saveMapPng from "../../src/save-map-png.js";
import { isValidId, isValidMapDescription, isValidTitle } from "../../public/scripts/validators.js";
import { CreateMapRequestPayload, CreateMapResponse } from "../../src/types";

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
  const payloadValidationCode = isValidCreateMapRequestPayload(newMapPayload);
  if (payloadValidationCode !== CreateMapRequestValidationCode.Ok) return { success: false };
  const turnData = await readTurnData(settings.world, settings.turn);
  if (turnData === null) return { success: false };
  const generator = new MapGenerator(turnData, settings);
  const mapImageData = generator.getMap();
  const collectionExists = newMapPayload.collection > 0;
  const newCollectionTitle = `Nowa kolekcja ${req.session.user.login}`;
  if (!collectionExists) {
    const newMapDescription = "bez opisu";
    const createdCollection = await createCollection(settings.world, authorId, newCollectionTitle, newMapDescription);
    if (!createdCollection) return { success: false };
    newMapPayload.collection = createdCollection.id;
  }
  const createdMap = await createMap(settings.turn, newMapPayload.title, newMapPayload.description, settings, newMapPayload.collection);
  if (!createdMap) return { success: false };
  saveMapPng(createdMap.id, mapImageData as ImageData);
  if (collectionExists) return { success: true };
  else return { success: true, newCollection: { id: newMapPayload.collection, title: newCollectionTitle, worldId: settings.world } };
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
