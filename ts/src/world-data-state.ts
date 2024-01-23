import parseTurnData from "./parse-turn-data.js";
import { createTurnData } from "./queries/turn-data.js";
import { createWorld, readWorlds, readWorldsWithWorldData } from "./queries/world.js";
import { WorldDataState, TurnDataState, CreateWorldRequestPayload } from "./types";
import { areDataFilesAvailable, createWorldDirectory, getDirectories, getWorldDirectoryName, parseWorldInfoFile } from "./temp-directory-handlers.js";
import { getLatestTurn } from "../public/scripts/generator-controller-helpers.js";

export const getWorldDataStates = async function (): Promise<WorldDataState[]> {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataStates: WorldDataState[] = [];
  for (const world of worldsWithWorldData) {
    const latestTurn = getLatestTurn(world);
    const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
    const addedWorldDataState: WorldDataState = {
      filesDirectoryName: worldDirectoryName,
      id: world.id,
      serverName: world.server + world.num,
      turns: [],
    };
    for (let turn = 0; turn <= latestTurn; turn++) {
      const areFilesAvailable = await areDataFilesAvailable(worldDirectoryName, turn);
      const turnDataState: TurnDataState = {
        hasDataFiles: areFilesAvailable,
        isParsed: false,
      };
      addedWorldDataState.turns.push(turnDataState);
    }
    for (const turnData of world.worldData) {
      const turn = turnData.turn;
      if (addedWorldDataState.turns[turn]) addedWorldDataState.turns[turn].isParsed = true;
      else console.log(`${world.server}${world.num}: Turn ${turn} is out of range 0-${addedWorldDataState.turns.length - 1}`);
    }
    worldDataStates.push(addedWorldDataState);
  }
  return worldDataStates;
};

export const parseAvailableTurnData = async function () {
  const worldDataStates = await getWorldDataStates();
  for (const world of worldDataStates) {
    for (let turn = 0; turn < world.turns.length; turn++) {
      const turnDataState = world.turns[turn];
      if (!turnDataState.isParsed && turnDataState.hasDataFiles) {
        const worldDirectoryName = world.filesDirectoryName;
        const parsedTurnData = await parseTurnData(worldDirectoryName, turn);
        const createdWorldData = await createTurnData(world.id, turn, parsedTurnData);
        if (createdWorldData) console.log(`Turn data created for ${turn} turn of ${world.serverName}`);
        else console.log(`Failed to create turn data for ${turn} turn of ${world.serverName} world located in ${worldDirectoryName} directory`);
      }
    }
  }
};

export const synchronizeTempDirectories = async function () {
  const worldsFromDatabase = await readWorlds();
  for (let world of worldsFromDatabase) {
    const { id: number, ...rest } = world;
    const payload: CreateWorldRequestPayload = rest;
    createWorldDirectory(payload);
  }
  const worldDirectories = await getDirectories("temp");
  const newWorldDirectories = worldDirectories.filter((worldDirectory) => {
    return worldsFromDatabase.every((world) => {
      const correctWorldDirectoryName = getWorldDirectoryName(world.startTimestamp);
      return correctWorldDirectoryName !== worldDirectory;
    });
  });
  for (let worldDirectory of newWorldDirectories) {
    const worldInfo = await parseWorldInfoFile(worldDirectory);
    if (!worldInfo) return;
    const isWorldCreated = await createWorld(worldInfo);
    if (isWorldCreated) console.log(`Created a new world from ${worldDirectory} directory`);
    else console.log(`Failed to create a world from ${worldDirectory} directory`);
  }
};
