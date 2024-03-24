import { Request } from "express";
import { CreateMapRequestValidationCode, isValidCreateMapRequestPayload } from "../../public/scripts/requests-validators.js";
import MapGenerator from "../../public/scripts/class/map-generator.js";
import { createCollection } from "../../src/queries/collection.js";
import { createMap, deleteMap, readMap, updateMap } from "../../src/queries/map.js";
import { readTurnData } from "../../src/queries/turn-data.js";
import saveMapPng from "../../src/save-map-png.js";
import { isValidId, isValidMapDescription, isValidTitle } from "../../public/scripts/validators.js";
import { CreateMapRequestPayload, CreateMapResponse } from "../../src/types";
import { getPreferredTranslation } from "../../public/scripts/languages.js";

export const handleCreateMap = async function (req: Request): Promise<CreateMapResponse> {
  const user = req.session.user;
  const { settings, title, description, collectionId } = req.body;
  if (!user || user.rank < 2) return { success: false };
  const newMapPayload: CreateMapRequestPayload = {
    settings: settings,
    title: title,
    description: description,
    collectionId: collectionId,
  };
  const acceptedLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptedLanguages);
  const payloadValidationCode = isValidCreateMapRequestPayload(newMapPayload);
  if (payloadValidationCode !== CreateMapRequestValidationCode.Ok) return { success: false };
  const turnData = await readTurnData(settings.world, settings.day);
  if (!turnData) return { success: false };
  const generator = new MapGenerator(turnData, settings);
  const mapImageData = generator.getMap();
  const collectionExists = newMapPayload.collectionId > 0;
  const newCollectionTitle = `${translation.newCollection} ${user.login}`;
  if (!collectionExists) {
    const newMapDescription = translation.noDescription;
    const createdCollection = await createCollection(settings.world, user.id, newCollectionTitle, newMapDescription);
    if (!createdCollection) return { success: false };
    newMapPayload.collectionId = createdCollection.id;
  }
  const createdMap = await createMap(settings.day, newMapPayload.title, newMapPayload.description, settings, newMapPayload.collectionId);
  if (!createdMap) return { success: false };
  saveMapPng(createdMap.id, mapImageData as ImageData);
  if (collectionExists) return { success: true };
  else return { success: true, newCollection: { id: newMapPayload.collectionId, title: newCollectionTitle, worldId: settings.world } };
};

export const handleUpdateMap = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const { title, description } = req.body;
  if (!user || !isValidId(id)) return false;
  const map = await readMap(id);
  if (!map || map.collection.authorId !== user.id) return false;
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
  const user = req.session.user;
  if (!user || user.rank < 1) return false;
  const mapId = parseInt(req.params.id);
  if (!isValidId(mapId)) return false;
  const map = await readMap(mapId);
  if (!map || map.collection.authorId !== user.id) return false;
  const isDeleted = await deleteMap(mapId);
  return isDeleted;
};
