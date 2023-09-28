import fs from "fs/promises";
import parseTurnData from "./parse-turn-data.js";
import { createTurnData } from "./queries/turn-data.js";
import { readWorldsWithWorldData } from "./queries/world.js";
import { WorldDataState, TurnDataState } from "./types.js";
import { getWorldDirectoryName } from "./temp-directory-handlers.js";

const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];

export const areDataFilesAvailable = async function (worldDirectoryName: string, turn: number): Promise<boolean> {
  const dataFilesPath = `temp/${worldDirectoryName}/${turn}`;
  for (const file of files) {
    const dataFilePath = `${dataFilesPath}/${file}.txt.gz`;
    const alternativeDataFilePath = `${dataFilesPath}/${file}.txt`;
    try {
      await fs.access(dataFilePath);
    } catch {
      if (file !== "conquer") return false;
      try {
        await fs.access(alternativeDataFilePath);
      } catch {
        return false;
      }
    }
  }
  return true;
};

export const getWorldDataStates = async function (): Promise<WorldDataState[]> {
  const worldsWithWorldData = await readWorldsWithWorldData();
  const worldDataStates: WorldDataState[] = [];
  for (const world of worldsWithWorldData) {
    const numberOfTurns = Math.floor((Date.now() - world.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
    const addedWorldDataState: WorldDataState = {
      filesDirectoryName: worldDirectoryName,
      id: world.id,
      serverName: world.server + world.num,
      turns: [],
    };
    for (let turn = 0; turn <= numberOfTurns; turn++) {
      const areFilesAvailable = await areDataFilesAvailable(worldDirectoryName, turn);
      const turnDataState: TurnDataState = {
        hasDataFiles: areFilesAvailable,
        isParsed: false,
      };
      addedWorldDataState.turns.push(turnDataState);
    }
    for (const turnData of world.worldData) {
      const turn = turnData.turn;
      addedWorldDataState.turns[turn].isParsed = true;
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
