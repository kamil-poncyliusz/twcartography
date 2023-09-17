import { Request } from "express";
import { isValidId, isValidTurn } from "../../public/scripts/validators.js";
import { createTurnData, readTurnData } from "../../src/queries/turn-data.js";
import { readWorld } from "../../src/queries/world.js";
import { areDataFilesAvailable } from "../../src/world-data-state.js";
import parseTurnData from "../../src/parse-turn-data.js";
import { ParsedTurnData } from "../../src/types";

export const handleCreateTurnData = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const worldId = req.body.world as number;
  const turn = req.body.turn as number;
  if (!isValidId(worldId) || !isValidTurn(turn)) return false;
  const world = await readWorld(worldId);
  if (!world) return false;
  const worldDirectoryName = world.startTimestamp.toString(36);
  const areFilesAvailable = await areDataFilesAvailable(worldDirectoryName, turn);
  if (!areFilesAvailable) return false;
  const parsedTurnData = await parseTurnData(worldDirectoryName, turn);
  const createdWorldData = await createTurnData(world.id, turn, parsedTurnData);
  if (!createdWorldData) return false;
  return true;
};

export const handleReadTurnData = async function (req: Request): Promise<ParsedTurnData | null> {
  const worldId = parseInt(req.params.world);
  const turn = parseInt(req.params.turn);
  if (!isValidId(worldId) || !isValidTurn(turn)) return null;
  const data = await readTurnData(worldId, turn);
  if (data === null) return null;
  return data;
};
