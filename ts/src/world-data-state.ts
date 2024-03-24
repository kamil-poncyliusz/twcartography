import parseTurnData from "./parse-turn-data.js";
import { createTurnData } from "./queries/turn-data.js";
import { createWorld, readWorldsWithWorldData } from "./queries/world.js";
import { WorldDataState, TurnDataState } from "./types";
import { areDataFilesAvailable, getDirectories } from "./data-files-directory-handlers.js";
import { createServer, readServer, readServerByName } from "./queries/server.js";

const getAvailableDataFiles = async function (): Promise<{ [key: string]: string[] }> {
  const result: { [key: string]: string[] } = {};
  const worldDirectories = await getDirectories("data-files");
  for (const worldDirectory of worldDirectories) {
    const dayDirectories = await getDirectories(`data-files/${worldDirectory}`);
    const days: string[] = [];
    for (const dayDirectory of dayDirectories) {
      const day = parseInt(dayDirectory);
      const filesExist = await areDataFilesAvailable(worldDirectory, dayDirectory);
      if (filesExist) days.push(dayDirectory);
    }
    result[worldDirectory] = days;
  }
  return result;
};

export const getWorldDataStates = async function (): Promise<{ [key: string]: WorldDataState }> {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataStates: { [key: string]: WorldDataState } = {};
  for (const world of worldsWithWorldData) {
    const newWorld: WorldDataState = {
      name: world.name,
      id: world.id,
      days: {},
    };
    worldDataStates[world.name] = newWorld;
    for (const turnData of world.worldData) {
      const newDay: TurnDataState = {
        hasDataFiles: false,
        isParsed: true,
      };
      newWorld.days[String(turnData.day)] = newDay;
    }
  }
  const availableDataFiles = await getAvailableDataFiles();
  for (const worldName in availableDataFiles) {
    if (!worldDataStates[worldName]) {
      const newWorld: WorldDataState = {
        name: worldName,
        id: 0,
        days: {},
      };
      worldDataStates[worldName] = newWorld;
    }
    for (const day of availableDataFiles[worldName]) {
      if (!worldDataStates[worldName].days[day]) {
        const newDay: TurnDataState = {
          hasDataFiles: false,
          isParsed: false,
        };
        worldDataStates[worldName].days[day] = newDay;
      }
      worldDataStates[worldName].days[day].hasDataFiles = true;
    }
  }
  return worldDataStates;
};

export const parseAvailableTurnData = async function () {
  const worldDataStates = await getWorldDataStates();
  for (const worldName in worldDataStates) {
    const world = worldDataStates[worldName];
    if (world.id === 0) {
      const serverName = worldName.substring(0, 2);
      let server = await readServerByName(serverName);
      if (!server) {
        server = await createServer({ name: serverName, domain: null, updateHour: 0 });
        if (!server) {
          console.log(`Failed to create server ${serverName}`);
          continue;
        }
      }
      const createdWorld = await createWorld(server.id, worldName);
      if (!createdWorld) {
        console.log(`Failed to create world ${worldName}`);
        continue;
      }
      world.id = createdWorld.id;
    }
    for (const day in world.days) {
      const turnDataState = world.days[day];
      if (!turnDataState.isParsed && turnDataState.hasDataFiles) {
        const parsedTurnData = await parseTurnData(world.name, day);
        const createdWorldData = await createTurnData(world.id, parseInt(day), parsedTurnData);
        if (createdWorldData) console.log(`Turn data created for ${day} day of ${world.name} world`);
        else console.log(`Failed to create turn data for ${day} day of ${world.name} world`);
      }
    }
  }
};
