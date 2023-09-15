import express from "express";
import { getWorldDataStates } from "../src/world-data-state.js";
import { readUsers } from "../src/queries/user.js";
import { readWorlds } from "../src/queries/world.js";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", async (req, res) => {
  const worlds = await readWorlds();
  return res.render("admin/worlds", { worlds: worlds });
});
admin.get("/world-data", async (req, res) => {
  const worldDataStates = await getWorldDataStates();
  return res.render("admin/world-data", { state: worldDataStates });
});
admin.get("/users", async (req, res) => {
  const users = await readUsers();
  const ranks = [0, 1, 2, 10];
  return res.render("admin/users", { users: users, ranks: ranks });
});

export default admin;
