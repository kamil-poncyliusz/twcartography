import { Request } from "express";
import { isValidId, isValidDay } from "../../public/scripts/validators.js";
import { readTurnData } from "../../src/queries/turn-data.js";
import { ParsedTurnData } from "../../src/types";

export const handleReadTurnData = async function (req: Request): Promise<ParsedTurnData | null> {
  const worldId = parseInt(req.params.world);
  const day = req.params.day;
  if (!isValidId(worldId) || !isValidDay(day)) return null;
  const data = await readTurnData(worldId, day);
  if (!data) return null;
  return data;
};
