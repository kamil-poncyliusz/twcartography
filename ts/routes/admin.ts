import express from "express";
import { readWorldsWithWorldData } from "../src/queries/index.js";
import getWorldDataState from "../src/get-world-data-state.js";
import findWorldDataFiles from "../src/find-world-data-files.js";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", (req, res) => {
  return res.render("admin/worlds", {});
});
admin.get("/world-data", async (req, res) => {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataFiles = findWorldDataFiles();
  const worldDataState = getWorldDataState(worldsWithWorldData, worldDataFiles);
  return res.render("admin/worldData", { state: worldDataState });
});

export default admin;
