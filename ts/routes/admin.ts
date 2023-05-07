import express from "express";
import { readWorldsWithWorldData } from "../src/queries/index.js";

const admin = express.Router();

admin.get("/", (req, res) => {
  return res.render("admin/index", {});
});
admin.get("/worlds", (req, res) => {
  return res.render("admin/worlds", {});
});
admin.get("/world-data", async (req, res) => {
  const worldsWithWorldData = await readWorldsWithWorldData();
  if (!worldsWithWorldData) return res.status(404);
  return res.render("admin/worldData", { worlds: worldsWithWorldData });
});

export default admin;
