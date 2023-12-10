import express from "express";
import { getWorldDataStates } from "../../src/world-data-state.js";
import { readUsers } from "../../src/queries/user.js";
import { readWorlds } from "../../src/queries/world.js";
import { getPreferredTranslation } from "../../public/scripts/languages.js";

const adminRouter = express.Router();

adminRouter.get("/", (req, res) => {
  const acceptsLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptsLanguages);
  const locals = {
    translation: translation,
  };
  return res.render("admin/index", locals);
});
adminRouter.get("/worlds", async (req, res) => {
  const worlds = await readWorlds();
  const acceptsLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptsLanguages);
  const locals = {
    worlds: worlds,
    translation: translation,
  };
  return res.render("admin/worlds", locals);
});
adminRouter.get("/world-data", async (req, res) => {
  const worldDataStates = await getWorldDataStates();
  const acceptsLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptsLanguages);
  const locals = {
    state: worldDataStates,
    translation: translation,
  };
  return res.render("admin/world-data", locals);
});
adminRouter.get("/users", async (req, res) => {
  const users = await readUsers();
  const ranks = [0, 1, 2, 10];
  const acceptsLanguages = req.acceptsLanguages();
  const translation = getPreferredTranslation(acceptsLanguages);
  const locals = {
    users: users,
    ranks: ranks,
    translation: translation,
  };
  return res.render("admin/users", locals);
});

export default adminRouter;
