import express from "express";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { readMap, createUser, readUser, readUserByLogin, readWorlds } from "../src/queries/index.js";
import { World } from "@prisma/client";
import { Authorized, AuthorizedRequest, Created_mapWithRelations } from "../Types.js";

interface Locals {
  page: "index" | "maps" | "map" | "user" | "new";
  loggedIn: boolean;
  userId?: number;
  userLogin?: string;
  userRank?: number;
  worlds?: World[];
  map?: Created_mapWithRelations;
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
  if (!isValid || process.env.TOKEN_SECRET === undefined) return res.json({ success: false });
  const token = jsonwebtoken.sign({ id: user.id, login: user.login, rank: user.rank }, process.env.TOKEN_SECRET, {
    expiresIn: 1 * 60 * 60,
  });
  res.cookie("token", token, {
    maxAge: 1 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
  return res.json({ success: true, token: token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
  return res.json(true);
});

router.get("/map/:id", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("map", req.authorized);
  const id = parseInt(req.params.id);
  const map = await readMap(id);
  if (map === null) return res.status(404).render("not-found");
  locals.map = map;
  return res.render("map", locals);
});

router.get("/maps", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("maps", req.authorized);
  return res.render("maps", locals);
});

router.get("/new/:settings?", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("new", req.authorized);
  locals.encodedSettings = req.params.settings ?? "";
  res.render("new", locals);
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

router.get("/user/:id", async (req: AuthorizedRequest, res) => {
  const locals = await getLocals("user", req.authorized);
  const id = parseInt(req.params.id);
  const user = await readUser(id);
  if (user === null) return res.status(404).render("not-found");
  return res.render("user", locals);
});

export default router;
