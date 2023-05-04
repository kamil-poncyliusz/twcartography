import express from "express";
import { World, Created_map } from "@prisma/client";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { readMap } from "../src/queries/map.js";
import { createUser, readUser, readUserByLogin } from "../src/queries/user.js";
import { readWorlds } from "../src/queries/world.js";
import { Authorized, AuthorizedRequest } from "../public/scripts/Types.js";

interface Locals {
  page: "index" | "maps" | "map" | "user" | "new";
  loggedIn: boolean;
  userId?: number;
  userLogin?: string;
  userRank?: number;
  worlds?: World[];
  map?: Created_map;
  encodedSettings?: string;
}

async function getLocals(page: "index" | "maps" | "map" | "user" | "new", authorized: Authorized | undefined) {
  const locals: Locals = {
    page: page,
    loggedIn: false,
  };
  if (authorized) {
    locals.loggedIn = true;
    locals.userId = authorized.id;
    locals.userLogin = authorized.login;
    locals.userRank = authorized.rank;
  }
  if (page === "maps" || page === "new") {
    locals.worlds = await readWorlds();
  }
  return locals;
}

const router = express.Router();

router.get("/", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("index", req.authorized);
  return res.render("index", locals);
});

router.post("/auth", async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  if (!login || !password) return res.json({ success: false });
  if (login.length < 3 || login.length > 24 || password.length < 8 || password.length > 24)
    return res.json({ success: false });
  const user = await readUserByLogin(login);
  if (user === null || user === undefined) return res.json({ success: false });
  const hash = user.password;
  const isValid = bcrypt.compareSync(password, hash);
  if (!isValid) return res.json({ success: false });
  const token = jsonwebtoken.sign(
    { id: user.id, login: user.login, rank: user.rank },
    process.env.TOKEN_SECRET as string,
    {
      expiresIn: 1 * 60 * 60,
    }
  );
  res.cookie("token", token, {
    maxAge: 1 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  });
  return res.json({ success: true, token: token });
});

router.get("/register", (req, res) => {
  res.render("register", {});
});

router.post("/register", async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  if (!login || login.length < 3 || login.length > 24)
    return res.render("register", {
      success: false,
      message: "incorrect login",
    });
  if (!password || password.length < 8 || password.length > 24)
    return res.render("register", {
      success: false,
      message: "incorrect password",
    });
  const user = await readUserByLogin(login);
  if (user === undefined)
    return res.render("register", {
      success: false,
      message: "database error",
    });
  if (user !== null)
    return res.render("register", {
      success: false,
      message: "login taken",
    });
  const hash = bcrypt.hashSync(password, 5);
  const createdUser = await createUser(login, hash, 1);
  if (createdUser === null)
    return res.render("register", {
      success: false,
      message: "database error",
    });
  return res.render("register", {
    success: true,
  });
});

router.get("/maps", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("maps", req.authorized);
  return res.render("maps", locals);
});

router.get("/map/:id", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("map", req.authorized);
  const id = parseInt(req.params.id);
  const map = await readMap(id);
  if (map === null) return res.status(404);
  locals.map = map;
  return res.render("map", locals);
});

router.get("/new/:settings?", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("new", req.authorized);
  locals.encodedSettings = req.params.settings ?? "";
  res.render("new", locals);
});

router.get("/user/:id", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("user", req.authorized);
  const id = parseInt(req.params.id);
  const user = await readUser(id);
  if (user === null) return res.status(404);
  return res.render("user", locals);
});

export default router;
