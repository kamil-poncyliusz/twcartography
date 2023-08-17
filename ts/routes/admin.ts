import express from "express";
import { readUsers, readWorlds, readWorldsWithWorldData } from "../src/queries/index.js";
import { getWorldDataStates } from "../src/world-data-state.js";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", async (req, res) => {
  const worlds = await readWorlds();
  return res.render("admin/worlds", { worlds: worlds });
});
admin.get("/world-data", async (req, res) => {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataStates = getWorldDataStates(worldsWithWorldData);
  return res.render("admin/world-data", { state: worldDataStates });
});
admin.get("/users", async (req, res) => {
  const users = await readUsers();
  const ranks = [0, 1, 2, 10];
  return res.render("admin/users", { users: users, ranks: ranks });
});

export default admin;
