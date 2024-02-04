import { Request } from "express";
import { isValidId, isValidPassword, isValidUserRank } from "../../public/scripts/validators.js";
import { updateUser } from "../../src/queries/user.js";

export const handleUpdateUser = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const id = parseInt(req.params.id);
  const updatedFields = req.body.updatedFields;
  if (!user || user.rank < 10) return false;
  if (!updatedFields || !isValidId(id)) return false;
  if (isValidUserRank(updatedFields.rank)) {
    const success = await updateUser(id, { rank: updatedFields.rank });
    return success;
  } else if (isValidPassword(updatedFields.password)) {
    const success = await updateUser(id, { password: updatedFields.password });
    return success;
  } else return false;
};
