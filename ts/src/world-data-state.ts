import fs from "fs/promises";
import { WorldWithWorldData, WorldDataState, TurnDataState } from "./Types.js";

const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];

const areDataFilesAvailable = async function (worldDirectoryName: string, turn: number): Promise<boolean> {
  const dataFilesPath = `temp/${worldDirectoryName}/${turn}`;
  const hasAllWorldDataFiles = files.every(async (file) => {
    const dataFilePath = `${dataFilesPath}/${file}.txt.gz`;
    try {
      await fs.access(dataFilePath);
      return true;
    } catch {
      return false;
    }
  });
  return hasAllWorldDataFiles;
};

export const getWorldDataStates = async function (worldsWithWorldData: WorldWithWorldData[]): Promise<WorldDataState[]> {
  const worldDataStates: WorldDataState[] = [];
  for (const world of worldsWithWorldData) {
    const numberOfTurns = Math.floor((Date.now() - world.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    const worldDirectoryName = world.startTimestamp.toString(36);
    const addedWorldDataState: WorldDataState = {
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
