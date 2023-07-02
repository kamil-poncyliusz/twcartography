import * as map from "./map.js";
import * as user from "./user.js";
import * as world from "./world.js";
import * as turnData from "./turn-data.js";
import * as collection from "./collection.js";

export const createMap = map.createMap;
export const deleteMap = map.deleteMap;
export const readMap = map.readMap;
export const readMaps = map.readMaps;

export const createUser = user.createUser;
export const deleteUser = user.deleteUser;
export const deleteAllUsers = user.deleteAllUsers;
export const readUser = user.readUser;
export const readUserByLogin = user.readUserByLogin;
export const readUsers = user.readUsers;
export const updateUserRank = user.updateUserRank;

export const createWorld = world.createWorld;
export const deleteWorld = world.deleteWorld;
export const readWorld = world.readWorld;
export const readWorlds = world.readWorlds;
export const readWorldsWithWorldData = world.readWorldsWithWorldData;

export const createTurnData = turnData.createTurnData;
export const deleteTurnData = turnData.deleteTurnData;
export const readTurnData = turnData.readTurnData;

export const readCollection = collection.readCollection;
export const createCollection = collection.createCollection;
export const readUserCollections = collection.readUserCollections;
export const deleteCollection = collection.deleteCollection;
export const updateCollection = collection.updateCollection;
