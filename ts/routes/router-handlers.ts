import bcrypt from "bcryptjs";
import { Request } from "express";
import { createUser, readUserByLogin } from "../src/queries/index.js";

export const handleRegistration = async function (req: Request): Promise<string | true> {
  const login = req.body.login;
  const password = req.body.password;
  if (!login || login.length < 2 || login.length > 24) return "incorrect login";
  if (!password || password.length < 8 || password.length > 24) return "incorrect password";
  const user = await readUserByLogin(login);
  if (user === undefined) return "database error";
  if (user !== null) return "login taken";
  const passwordHash = bcrypt.hashSync(password, 5);
  const createdUser = await createUser(login, passwordHash, 1);
  if (createdUser === null) return "database error";
  return true;
};

export const handleAuthentication = async function (req: Request) {
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

export const handleLogout = async function (req: Request) {
  const loggedOut = await new Promise((resolve) => {
    req.session.destroy((err) => {
      if (err) return resolve(false);
      return resolve(true);
    });
  });
  return loggedOut;
};
