import fs from "fs";
import path from "path";
import daysFromStart from "./days-from-start.js";
import { WorldWithWorldData, WorldDataState } from "./Types.js";

const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];

const getDirectories = function (path: string) {
  if (typeof path !== "string") [];
  const entities = fs.readdirSync(path, { withFileTypes: true });
  const directories = entities.filter((entity) => entity.isDirectory());
  const directoryNames = directories.map((directory) => directory.name);
  return directoryNames;
};

const findWorldDataFiles = function () {
  const worldDataFiles: { [key: number]: { [key: number]: boolean } } = {};
  const worldDataFilesPath = "temp";
  const worldsDirectories = getDirectories(worldDataFilesPath);
  for (let worldDirectory of worldsDirectories) {
    const worldId = Number(worldDirectory);
    worldDataFiles[worldId] = {};
    const worldPath = path.join(worldDataFilesPath, worldDirectory);
    const turnsDirectories = getDirectories(worldPath);
    for (let turnDirectory of turnsDirectories) {
      const turn = Number(turnDirectory);
      const turnPath = path.join(worldPath, turnDirectory);
      const hasAllWorldDataFiles = files.every((file) => {
        const fileName = `${file}.txt.gz`;
        const filePath = path.join(turnPath, fileName);
        return fs.existsSync(filePath);
      });
      if (hasAllWorldDataFiles) {
        worldDataFiles[worldId][turn] = true;
      }
    }
  }
  return worldDataFiles;
};

export const getWorldDataState = function (worldsWithWorldData: WorldWithWorldData[]) {
  const worldDataState: WorldDataState[] = [];
  for (const world of worldsWithWorldData) {
    const startTimestamp = new Date(world.startTimestamp * 1000);
    const numberOfTurns = daysFromStart(startTimestamp);
    const addedWorld: WorldDataState = {
      id: world.id,
      serverName: world.server + world.num,
      turns: Array(numberOfTurns + 1)
        .fill(null)
        .map(() => ({
          id: -1,
          hasFiles: false,
        })),
    };
    for (const worldDataTurn of world.worldData) {
      const currentTurn = addedWorld.turns[worldDataTurn.turn];
      if (currentTurn) currentTurn.id = worldDataTurn.id;
    }
    const worldDataFiles = findWorldDataFiles();
    const turnsWithFiles = worldDataFiles[world.id];
    if (turnsWithFiles) {
      for (const turn in turnsWithFiles) {
        if (turnsWithFiles[turn] === true && addedWorld.turns[turn]) addedWorld.turns[turn].hasFiles = true;
      }
    }
    worldDataState.push(addedWorld);
  }
  return worldDataState;
};
