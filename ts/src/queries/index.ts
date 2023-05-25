import * as map from "./map.js";
import * as user from "./user.js";
import * as world from "./world.js";
import * as worldData from "./world-data.js";

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

export const createWorld = world.createWorld;
export const deleteWorld = world.deleteWorld;
export const readWorld = world.readWorld;
export const readWorlds = world.readWorlds;
export const readWorldsWithWorldData = world.readWorldsWithWorldData;

export const createWorldData = worldData.createWorldData;
export const deleteWorldData = worldData.deleteWorldData;
export const readWorldData = worldData.readWorldData;
