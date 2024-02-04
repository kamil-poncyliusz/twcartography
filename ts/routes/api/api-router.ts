import express from "express";
import { handleCreateAnimation, handleDeleteAnimation } from "./animation-handlers.js";
import { handleDeleteCollection, handleReadCollections, handleUpdateCollection } from "./collection-handlers.js";
import { handleCreateMap, handleDeleteMap, handleUpdateMap } from "./map-handlers.js";
import { handleCreateTurnData, handleReadTurnData } from "./turn-data-handlers.js";
import { handleUpdateUser } from "./user-handlers.js";
import { handleCreateWorld, handleDeleteWorld, handleReadWorld, handleUpdateWorld } from "./world-handlers.js";

const apiRouter = express.Router();

const handleRequest = async (handler: Function, req: express.Request, res: express.Response) => {
  const responseData = await handler(req);
  return res.json(responseData);
};

apiRouter.post("/animation", (req, res) => handleRequest(handleCreateAnimation, req, res));
apiRouter.delete("/animation/:id", (req, res) => handleRequest(handleDeleteAnimation, req, res));

apiRouter.get("/collections/:world/:author/:page", (req, res) => handleRequest(handleReadCollections, req, res));
apiRouter.patch("/collection/:id", (req, res) => handleRequest(handleUpdateCollection, req, res));
apiRouter.delete("/collection/:id", (req, res) => handleRequest(handleDeleteCollection, req, res));

apiRouter.post("/map", (req, res) => handleRequest(handleCreateMap, req, res));
apiRouter.patch("/map/:id", (req, res) => handleRequest(handleUpdateMap, req, res));
apiRouter.delete("/map/:id", (req, res) => handleRequest(handleDeleteMap, req, res));

apiRouter.post("/turn-data", (req, res) => handleRequest(handleCreateTurnData, req, res));
apiRouter.get("/turn-data/:world/:turn", (req, res) => handleRequest(handleReadTurnData, req, res));

apiRouter.patch("/user/:id", (req, res) => handleRequest(handleUpdateUser, req, res));

apiRouter.post("/world", (req, res) => handleRequest(handleCreateWorld, req, res));
apiRouter.get("/world/:id", (req, res) => handleRequest(handleReadWorld, req, res));
apiRouter.delete("/world/:id", (req, res) => handleRequest(handleDeleteWorld, req, res));
apiRouter.patch("/world/:id", (req, res) => handleRequest(handleUpdateWorld, req, res));

export default apiRouter;
