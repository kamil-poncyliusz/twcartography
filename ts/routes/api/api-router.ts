import express from "express";
import { handleCreateAnimation, handleDeleteAnimation } from "./animation-handlers.js";
import { handleDeleteCollection, handleReadCollections, handleUpdateCollection } from "./collection-handlers.js";
import { handleCreateMap, handleDeleteMap, handleUpdateMap } from "./map-handlers.js";
import { handleCreateTurnData, handleReadTurnData } from "./turn-data-handlers.js";
import { handleUpdateUser } from "./user-handlers.js";
import { handleCreateWorld, handleDeleteWorld, handleReadWorld, handleUpdateWorld } from "./world-handlers.js";

const apiRouter = express.Router();

apiRouter.post("/animation", async (req, res) => {
  const responseData = await handleCreateAnimation(req);
  return res.json(responseData);
});
apiRouter.delete("/animation/:id", async (req, res) => {
  const responseData = await handleDeleteAnimation(req);
  return res.json(responseData);
});

apiRouter.get("/collections/:world/:author/:page", async (req, res) => {
  const responseData = await handleReadCollections(req);
  return res.json(responseData);
});
apiRouter.patch("/collection/:id", async (req, res) => {
  const responseData = await handleUpdateCollection(req);
  return res.json(responseData);
});
apiRouter.delete("/collection/:id", async (req, res) => {
  const responseData = await handleDeleteCollection(req);
  return res.json(responseData);
});

apiRouter.post("/map", async (req, res) => {
  const responseData = await handleCreateMap(req);
  return res.json(responseData);
});
apiRouter.patch("/map/:id", async (req, res) => {
  const responseData = await handleUpdateMap(req);
  return res.json(responseData);
});
apiRouter.delete("/map/:id", async (req, res) => {
  const responseData = await handleDeleteMap(req);
  return res.json(responseData);
});

apiRouter.post("/turn-data", async (req, res) => {
  const responseData = await handleCreateTurnData(req);
  return res.json(responseData);
});
apiRouter.get("/turn-data/:world/:turn", async (req, res) => {
  const responseData = await handleReadTurnData(req);
  return res.json(responseData);
});

apiRouter.patch("/user/:id", async (req, res) => {
  const responseData = await handleUpdateUser(req);
  return res.json(responseData);
});

apiRouter.post("/world", async (req, res) => {
  const responseData = await handleCreateWorld(req);
  return res.json(responseData);
});
apiRouter.get("/world/:id", async (req, res) => {
  const responseData = await handleReadWorld(req);
  return res.json(responseData);
});
apiRouter.delete("/world/:id", async (req, res) => {
  const responseData = await handleDeleteWorld(req);
  return res.json(responseData);
});
apiRouter.patch("/world/:id", async (req, res) => {
  const responseData = await handleUpdateWorld(req);
  return res.json(responseData);
});

export default apiRouter;
