import { Request } from "express";
import { isValidId, isValidUserRank } from "../../public/scripts/validators.js";
import { updateUserRank } from "../../src/queries/user.js";

export const handleUpdateUserRank = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const id = req.body.id;
  const rank = req.body.rank;
  if (!isValidId(id) || !isValidUserRank(rank)) return false;
  const success = await updateUserRank(id, rank);
  return success;
};
