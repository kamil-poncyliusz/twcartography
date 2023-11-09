import { Request } from "express";
import { isValidId, isValidTimestamp } from "../../public/scripts/validators.js";
import { createWorld, deleteWorld, readWorld, updateWorld } from "../../src/queries/world.js";
import { isValidCreateWorldRequestPayload } from "../../public/scripts/requests-validators.js";
import { createWorldDirectory, deleteWorldDirectory, getWorldDirectoryName } from "../../src/temp-directory-handlers.js";
import turnDataDownloaderDaemon from "../../src/turn-data-downloader-daemon.js";
import { World } from "@prisma/client";
import { CreateWorldRequestPayload } from "../../src/types";

export const handleCreateWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  if (!isValidCreateWorldRequestPayload(req.body)) return false;
  const modifiedStartTimestamp: number = req.body.startTimestamp + Math.floor(Math.random() * 15);
  const createWorldRequestPayload: CreateWorldRequestPayload = {
    server: req.body.server,
    num: req.body.num,
    domain: req.body.domain,
    startTimestamp: modifiedStartTimestamp,
    endTimestamp: 0,
  };
  if (!isValidCreateWorldRequestPayload(createWorldRequestPayload)) return false;
  const createdWorld = await createWorld(createWorldRequestPayload);
  if (!createdWorld) return false;
  const isWorldDirectoryCreated = await createWorldDirectory(createWorldRequestPayload);
  if (isWorldDirectoryCreated) {
    turnDataDownloaderDaemon.startDownloading(createdWorld);
    console.log("World created");
  }
  return isWorldDirectoryCreated;
};

export const handleReadWorld = async function (req: Request): Promise<World | null> {
  const id = parseInt(req.params.id);
  if (!isValidId(id)) return null;
  const data = await readWorld(id);
  return data;
};

export const handleDeleteWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.id;
  if (!isValidId(worldId)) return false;
  const deletedWorld = await deleteWorld(worldId);
  if (!deletedWorld) return false;
  const worldDirectoryName = getWorldDirectoryName(deletedWorld.startTimestamp);
  turnDataDownloaderDaemon.stopDownloading(deletedWorld);
  await deleteWorldDirectory(worldDirectoryName);
  return true;
};

export const handleUpdateWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.id;
  const endTimestamp = req.body.endTimestamp;
  if (!isValidId(worldId)) return false;
  if (!isValidTimestamp(endTimestamp)) return false;
  const isUpdated = await updateWorld(worldId, { endTimestamp: endTimestamp });
  if (!isUpdated) return false;
  return true;
};
