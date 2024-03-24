import { Request } from "express";
import { isValidId } from "../../public/scripts/validators.js";
import { readWorld } from "../../src/queries/world.js";
import { World } from "@prisma/client";

export const handleReadWorld = async function (req: Request): Promise<World | null> {
  const id = parseInt(req.params.id);
  if (!isValidId(id)) return null;
  const data = await readWorld(id);
  return data;
};
