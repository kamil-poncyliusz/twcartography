import bcrypt from "bcryptjs";
import { Request } from "express";
import { createUser, readCollection, readCollections, readUserByLogin } from "../src/queries/index.js";
import { isValidId, isValidLogin, isValidPassword } from "../public/scripts/validators.js";

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
  const locals = {
    page: "collection",
    user: req.session.user,
    collection: collection,
  };
  return locals;
};

export const handleReadCollections = async function (req: Request) {
  const worldId = parseInt(req.params.world);
  if (!isValidId(worldId)) return false;
  const collections = await readCollections(worldId, undefined);
  for (let collection of collections) {
    if (collection.maps.length > 0) collection.maps = collection.maps.slice(-1);
  }
  const locals = {
    page: "collections",
    user: req.session.user,
    collections: collections,
  };
  return locals;
};
