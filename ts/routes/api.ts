import express from "express";
import {
  handleCreateMap,
  handleCreateTurnData,
  handleCreateWorld,
  handleDeleteWorld,
  handleReadMaps,
  handleReadTurnData,
  handleReadWorld,
  handleUpdateUserRank,
} from "./api-handlers.js";

const api = express.Router();

api.get("/world/:id", async (req, res) => {
  const responseData = await handleReadWorld(req);
  return res.json(responseData);
});
api.get("/world-data/:world/:turn", async (req, res) => {
  const responseData = await handleReadTurnData(req);
  return res.json(responseData);
});
api.post("/map/create", async (req, res) => {
  const responseData = await handleCreateMap(req);
  return res.json(responseData);
});
api.get("/maps/:world/:author/:timespan/:order/:page", async (req, res) => {
  const responseData = await handleReadMaps(req);
  return res.json(responseData);
});
api.post("/world/create", async (req, res) => {
  const responseData = await handleCreateWorld(req);
  return res.json(responseData);
});
api.post("/world-data/create/:world/:turn", async (req, res) => {
  const responseData = await handleCreateTurnData(req);
  return res.json(responseData);
});
api.post("/user/update/rank", async (req, res) => {
  const responseData = await handleUpdateUserRank(req);
  return res.json(responseData);
});
api.post("/world/delete", async (req, res) => {
  const responseData = await handleDeleteWorld(req);
  return res.json(responseData);
});

export default api;
