import express from "express";
import { readCollection, readMap, readUser, readUserCollections, readWorlds } from "../src/queries/index.js";
import { handleAuthentication, handleLogout, handleRegistration } from "./router-handlers.js";
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

router.get("/map/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) return res.status(404).render("not-found");
  const map = await readMap(id);
  if (map === null) return res.status(404).render("not-found");
  const locals = {
    page: "map",
    user: req.session.user,
    map: map,
  };
  return res.render("map", locals);
});

router.get("/maps", async (req, res) => {
  const worlds = await readWorlds();
  const locals = {
    page: "maps",
    user: req.session.user,
    worlds: worlds,
  };
  return res.render("maps", locals);
});

router.get("/new/:settings?", async (req, res) => {
  const worlds = await readWorlds();
  const locals = {
    page: "new",
    user: req.session.user,
    encodedSettings: req.params.settings ?? "",
    worlds: worlds,
    collections: [] as Collection[],
  };
  if (req.session.user && req.session.user.rank >= 2) {
    const collections = await readUserCollections(req.session.user.id);
    locals.collections = collections;
  }
  res.render("new", locals);
});

router.get("/user/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) return res.status(404).render("not-found");
  const user = await readUser(id);
  if (user === null) return res.status(404).render("not-found");
  const locals = {
    page: "user",
    user: req.session.user,
    displayedUser: user,
  };
  return res.render("user", locals);
});

router.get("/collection/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) return res.status(404).render("not-found");
  const collection = await readCollection(id);
  if (collection === null) return res.status(404).render("not-found");
  const locals = {
    page: "collection",
    user: req.session.user,
    collection: collection,
  };
  return res.render("collection", locals);
});

export default router;
