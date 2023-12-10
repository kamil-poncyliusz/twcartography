import { Request } from "express";
import bcrypt from "bcryptjs";
import { isValidId, isValidLogin, isValidPassword } from "../public/scripts/validators.js";
import { readCollection } from "../src/queries/collection.js";
import { createUser, readUserByLogin } from "../src/queries/user.js";
import { getPreferredTranslation } from "../public/scripts/languages.js";

export const handleRegistration = async function (req: Request): Promise<string> {
  const login = req.body.login;
  const password = req.body.password;
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

export const handleAuthentication = async function (req: Request): Promise<boolean> {
  const login = req.body.login;
  const password = req.body.password;
  if (!login || !password) return false;
  if (login.length < 3 || login.length > 24 || password.length < 8 || password.length > 24) return false;
  const user = await readUserByLogin(login);
  if (user === null || user === undefined) return false;
  const passwordHash = user.password;
  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) return false;
  const isSessionCreated: boolean = await new Promise((resolve) => {
    req.session.regenerate((err) => {
      if (err) resolve(false);
      req.session.user = {
        id: user.id,
        login: user.login,
        rank: user.rank,
      };
      resolve(true);
    });
  });
  return isSessionCreated;
};

export const handleLogout = async function (req: Request): Promise<boolean> {
  const loggedOut: boolean = await new Promise((resolve) => {
    req.session.destroy((err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  });
  return loggedOut;
};

export const handleReadCollection = async function (req: Request) {
  const collectionId = parseInt(req.params.id);
  if (!isValidId(collectionId)) return false;
  const collection = await readCollection(collectionId);
  if (collection === null) return false;
  const acceptsLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptsLanguages);
  const locals = {
    page: "collection",
    user: req.session.user,
    collection: collection,
    translation: translation,
  };
  return locals;
};
