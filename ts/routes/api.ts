import express from "express";
import {
  handleCreateMap,
  handleCreateTurnData,
  handleCreateWorld,
  handleDeleteCollection,
  handleDeleteMap,
  handleDeleteWorld,
  handleReadMaps,
  handleReadTurnData,
  handleReadWorld,
  handleUpdateCollection,
  handleUpdateUserRank,
} from "./api-handlers.js";

const api = express.Router();

api.get("/world/:id", async (req, res) => {
  const responseData = await handleReadWorld(req);
  return res.json(responseData);
});
api.get("/turn-data/:world/:turn", async (req, res) => {
  const responseData = await handleReadTurnData(req);
  return res.json(responseData);
});
api.post("/map/create", async (req, res) => {
  const responseData = await handleCreateMap(req);
  return res.json(responseData);
});
api.post("/map/delete", async (req, res) => {
  const responseData = await handleDeleteMap(req);
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
api.post("/world-data/create", async (req, res) => {
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
api.post("/collection/delete", async (req, res) => {
  const responseData = await handleDeleteCollection(req);
  return res.json(responseData);
});
api.post("/collection/update", async (req, res) => {
  const responseData = await handleUpdateCollection(req);
  return res.json(responseData);
});

export default api;
