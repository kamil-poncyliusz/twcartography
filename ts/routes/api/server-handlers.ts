import { Request } from "express";
import { createServer } from "../../src/queries/server.js";
import { CreateServerRequestPayload } from "../../src/types";
import { isValidCreateServerRequestPayload } from "../../public/scripts/requests-validators.js";

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
  return true;
};

// export const handleDeleteServer = async function (req: Request): Promise<boolean> {
//   const user = req.session.user;
//   const serverId = parseInt(req.params.id);
//   if (!user || user.rank < 10 || !isValidId(serverId)) return false;
//   const deletedServer = await deleteServer(serverId);
//   if (!deletedServer) return false;
//   // turnDataDownloaderDaemon.stopDownloading(deletedServer);
//   await deleteServerDirectory(deletedServer.name);
//   return true;
// };
