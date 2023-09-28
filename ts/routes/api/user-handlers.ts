import { Request } from "express";
import { isValidId, isValidPassword, isValidUserRank } from "../../public/scripts/validators.js";
import { updateUser } from "../../src/queries/user.js";

export const handleUpdateUser = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 10) return false;
  const id = req.body.id;
  if (!req.body.updatedFields) return false;
  const rank = req.body.updatedFields.rank;
  const password = req.body.updatedFields.password;
  if (!isValidId(id)) return false;
  if (isValidUserRank(rank)) {
    const success = await updateUser(id, { rank: rank });
    return success;
  } else if (isValidPassword(password)) {
    const success = await updateUser(id, { password: password });
    return success;
  } else return false;
};
