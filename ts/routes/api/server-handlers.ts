import { Request } from "express";
import { createServer, deleteServer } from "../../src/queries/server.js";
import { CreateServerRequestPayload } from "../../src/types";
import { isValidCreateServerRequestPayload } from "../../public/scripts/requests-validators.js";
import dataFilesDownloaderDaemon from "../../src/data-files-downloader-daemon.js";
import { isValidId } from "../../public/scripts/validators.js";
import { deleteServerDirectories } from "../../src/data-files-directory-handlers.js";

export const handleCreateServer = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const payload: CreateServerRequestPayload = {
    name: req.body.name,
    domain: req.body.domain,
    updateHour: req.body.updateHour,
  };
  if (!isValidCreateServerRequestPayload(payload)) return false;
  const createdServer = await createServer(payload);
  if (!createdServer) return false;
  dataFilesDownloaderDaemon.startDownloading(createdServer);
  return true;
};

export const handleDeleteServer = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const serverId = parseInt(req.params.id);
  if (!isValidId(serverId)) return false;
  const deletedServer = await deleteServer(serverId);
  if (!deletedServer) return false;
  dataFilesDownloaderDaemon.stopDownloading(deletedServer);
  await deleteServerDirectories(deletedServer.name);
  return true;
};
