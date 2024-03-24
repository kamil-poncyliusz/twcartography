import express from "express";
import { handleCreateAnimation, handleDeleteAnimation } from "./animation-handlers.js";
import { handleDeleteCollection, handleReadCollections, handleUpdateCollection } from "./collection-handlers.js";
import { handleCreateMap, handleDeleteMap, handleUpdateMap } from "./map-handlers.js";
import { handleReadTurnData } from "./turn-data-handlers.js";
import { handleCreateUser, handleUpdateUser } from "./user-handlers.js";
import { handleReadWorld } from "./world-handlers.js";
import { handleCreateServer } from "./server-handlers.js";

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

// apiRouter.post("/turn-data", (req, res) => handleRequest(handleCreateTurnData, req, res));
apiRouter.get("/turn-data/:world/:day", (req, res) => handleRequest(handleReadTurnData, req, res));

apiRouter.patch("/user/:id", (req, res) => handleRequest(handleUpdateUser, req, res));
apiRouter.post("/user", (req, res) => handleRequest(handleCreateUser, req, res));

apiRouter.get("/world/:id", (req, res) => handleRequest(handleReadWorld, req, res));

// apiRouter.get("/servers", (req, res) => handleRequest(handleReadServers, req, res));
apiRouter.post("/servers", (req, res) => handleRequest(handleCreateServer, req, res));
// apiRouter.delete("/server/:id", (req, res) => handleRequest(handleDeleteServer, req, res));
export default apiRouter;
