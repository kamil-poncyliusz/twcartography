import { Request } from "express";
import { isValidId } from "../../public/scripts/validators.js";
import { createWorld, deleteWorld, readWorld } from "../../src/queries/world.js";
import { isValidCreateWorldRequestPayload } from "../../public/scripts/requests-validators.js";
import { createWorldDirectory, deleteWorldDirectory } from "../../src/temp-directory-handlers.js";
import turnDataDownloaderDaemon from "../../src/turn-data-downloader-daemon.js";
import { World } from "@prisma/client";
import { CreateWorldRequestPayload } from "../../src/types";

export const handleCreateWorld = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  if (!isValidCreateWorldRequestPayload(req.body)) return false;
  const modifiedTimestamp: number = req.body.timestamp + Math.floor(Math.random() * 15);
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
  const worldDirectoryName = deletedWorld.startTimestamp.toString(36);
  turnDataDownloaderDaemon.stopDownloading(deletedWorld);
  await deleteWorldDirectory(worldDirectoryName);
  return true;
};
