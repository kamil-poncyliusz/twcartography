import express from "express";
import { readCollection, readCollections, readMap, readUser, readWorlds } from "../src/queries/index.js";
import { handleAuthentication, handleLogout, handleReadCollection, handleReadCollections, handleRegistration } from "./router-handlers.js";
import { Collection } from "@prisma/client";
import { isValidID } from "../public/scripts/validators.js";

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
  const locals = {
    page: "new",
    user: req.session.user,
    encodedSettings: req.params.settings ?? "",
    worlds: worlds,
    collections: [] as Collection[],
  };
  if (req.session.user && req.session.user.rank >= 2) {
    const authorID = req.session.user.id;
    const collections = await readCollections(undefined, authorID);
    locals.collections = collections;
  }
  res.render("new", locals);
});

router.get("/user/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!isValidID(id)) return res.status(404).render("not-found");
  const user = await readUser(id);
  if (user === null) return res.status(404).render("not-found");
  const locals = {
    page: "user",
    user: req.session.user,
    displayedUser: user,
  };
  return res.render("user", locals);
});

router.get("/collections", async (req, res) => {
  const worlds = await readWorlds();
  const locals = {
    page: "collections-worlds-list",
    user: req.session.user,
    worlds: worlds,
  };
  return res.render("collections-worlds-list", locals);
});

router.get("/collections/:world", async (req, res) => {
  const locals = await handleReadCollections(req);
  if (locals === false) return res.status(404).render("not-found");
  return res.render("collections", locals);
});

router.get("/collection/:id", async (req, res) => {
  const locals = await handleReadCollection(req);
  if (locals === false) return res.status(404).render("not-found");
  return res.render("collection", locals);
});

export default router;
