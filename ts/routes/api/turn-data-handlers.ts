import { Request } from "express";
import { isValidId, isValidTurn } from "../../public/scripts/validators.js";
import { areDataFilesAvailable, getWorldDirectoryName } from "../../src/temp-directory-handlers.js";
import { createTurnData, readTurnData } from "../../src/queries/turn-data.js";
import { readWorld } from "../../src/queries/world.js";
import parseTurnData from "../../src/parse-turn-data.js";
import { ParsedTurnData } from "../../src/types";

export const handleCreateTurnData = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const { worldId, turn } = req.body;
  if (!user || user.rank < 10) return false;
  if (!isValidId(worldId) || !isValidTurn(turn)) return false;
  const world = await readWorld(worldId);
  if (!world) return false;
  const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
  const areFilesAvailable = await areDataFilesAvailable(worldDirectoryName, turn);
  if (!areFilesAvailable) return false;
  const parsedTurnData = await parseTurnData(worldDirectoryName, turn);
  const createdWorldData = await createTurnData(world.id, turn, parsedTurnData);
  return createdWorldData;
};

export const handleReadTurnData = async function (req: Request): Promise<ParsedTurnData | null> {
  const worldId = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (!isValidId(worldId) || !isValidTurn(turn)) return null;
  const data = await readTurnData(worldId, turn);
  if (!data) return null;
  return data;
};
