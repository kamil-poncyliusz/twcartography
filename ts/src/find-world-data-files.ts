import fs from "fs";
import path from "path";

const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];

const getDirectories = function (path: fs.PathLike) {
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

export default findWorldDataFiles;
