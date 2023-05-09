import express from "express";
import { readWorldsWithWorldData } from "../src/queries/index.js";
import getWorldDataState from "../src/get-world-data-state.js";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", (req, res) => {
  return res.render("admin/worlds", {});
});
admin.get("/world-data", async (req, res) => {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataState = getWorldDataState(worldsWithWorldData);
  return res.render("admin/worldData", { state: worldDataState });
});

export default admin;
