import bcrypt from "bcryptjs";
import { Request } from "express";
import { isValidId, isValidLogin, isValidPassword, isValidUserRank } from "../../public/scripts/validators.js";
import { createUser, readUserByLogin, updateUser } from "../../src/queries/user.js";

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

export const handleCreateUser = async function (req: Request): Promise<string> {
  const { login, password } = req.body;
  if (!isValidLogin(login)) return "incorrect login";
  if (!isValidPassword(password)) return "incorrect password";
  const user = await readUserByLogin(login);
  if (user === undefined) return "database error";
  if (user !== null) return "login taken";
  const passwordHash = bcrypt.hashSync(password, 5);
  const createdUser = await createUser(login, passwordHash, 2);
  if (!createdUser) return "database error";
  return "success";
};
