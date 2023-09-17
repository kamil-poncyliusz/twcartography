import express from "express";
import { handleAuthentication, handleLogout, handleReadCollection, handleRegistration } from "./handlers.js";
import { isValidId } from "../public/scripts/validators.js";
import { readCollections } from "../src/queries/collection.js";
import { readUser } from "../src/queries/user.js";
import { readWorlds } from "../src/queries/world.js";
import { Collection } from "@prisma/client";

const router = express.Router();

router.get("/", async (req, res) => {
  const locals = {
    page: "index",
    user: req.session.user,
  };
  return res.render("index", locals);
});

router.post("/auth", async (req, res) => {
  const responseData = await handleAuthentication(req);
  return res.json(responseData);
});

router.post("/logout", async (req, res) => {
  const responseData = await handleLogout(req);
  res.json(responseData);
});

router.post("/register", async (req, res) => {
  const responseData = await handleRegistration(req);
  return res.json(responseData);
});

router.get("/new/:settings?", async (req, res) => {
  const worlds = await readWorlds();
  worlds.sort((a, b) => {
    if (a.server + a.num < b.server + b.num) return -1;
    return 1;
  });
  const locals = {
    page: "new",
    user: req.session.user,
    encodedSettings: req.params.settings ?? "",
    worlds: worlds,
    collections: [] as Collection[],
  };
  if (req.session.user && req.session.user.rank >= 2) {
    const authorId = req.session.user.id;
    const collections = await readCollections(0, { authorId: authorId, worldId: 0 });
    locals.collections = collections;
  }
  res.render("new", locals);
});

router.get("/user/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!isValidId(id)) return res.status(404).render("not-found");
  const displayedUser = await readUser(id);
  if (displayedUser === null) return res.status(404).render("not-found");
  const locals = {
    page: "user",
    user: req.session.user,
    displayedUser: displayedUser,
  };
  return res.render("user", locals);
});

router.get("/collections", async (req, res) => {
  const worlds = await readWorlds();
  const locals = {
    page: "collections",
    user: req.session.user,
    worlds: worlds,
  };
  return res.render("collections", locals);
});

router.get("/collection/:id", async (req, res) => {
  const locals = await handleReadCollection(req);
  if (locals === false) return res.status(404).render("not-found");
  return res.render("collection", locals);
});

export default router;
