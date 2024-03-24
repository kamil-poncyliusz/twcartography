import { Request } from "express";
import { isValidId, isValidDayTimestamp } from "../../public/scripts/validators.js";
import { readTurnData } from "../../src/queries/turn-data.js";
import { ParsedTurnData } from "../../src/types";

// export const handleCreateTurnData = async function (req: Request): Promise<boolean> {
//   const user = req.session.user;
//   const { worldId, day } = req.body;
//   if (!user || user.rank < 10) return false;
//   if (!isValidId(worldId) || !isValidDayTimestamp(day)) return false;
//   const world = await readWorld(worldId);
//   if (!world) return false;
//   const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
//   const areFilesAvailable = await areDataFilesAvailable(worldDirectoryName, day);
//   if (!areFilesAvailable) return false;
//   const parsedTurnData = await parseTurnData(worldDirectoryName, day);
//   const createdWorldData = await createTurnData(world.id, day, parsedTurnData);
//   return createdWorldData;
// };

export const handleReadTurnData = async function (req: Request): Promise<ParsedTurnData | null> {
  const worldId = parseInt(req.params.world);
  const day = parseInt(req.params.day);
  if (!isValidId(worldId) || !isValidDayTimestamp(day)) return null;
  const data = await readTurnData(worldId, day);
  if (!data) return null;
  return data;
};
