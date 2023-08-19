import fs from "fs";
import { CreateWorldRequestPayload } from "./Types";
import { isValidCreateWorldRequestPayload } from "../public/scripts/validators.js";
import { createWorld, readWorlds } from "./queries/index.js";

const worldDirectoriesPath = "temp";

const getDirectories = function (path: string): string[] {
  if (typeof path !== "string") [];
  const entities = fs.readdirSync(path, { withFileTypes: true });
  const directories = entities.filter((entity) => entity.isDirectory());
  const directoryNames = directories.map((directory) => directory.name);
  return directoryNames;
};

const parseWorldInfoFile = function (worldDirectoryName: string): CreateWorldRequestPayload | null {
  const infoFilePath = `${worldDirectoriesPath}/${worldDirectoryName}/info`;
  if (!fs.existsSync(infoFilePath)) {
    console.log(`World info file doesn't exist in ${worldDirectoryName} directory`);
    return null;
  }
  const fileContents = fs.readFileSync(infoFilePath);
  const fileRows = fileContents.toString().split("\n");
  const parsed: { [key: string]: any } = {};
  for (let row of fileRows) {
    let [key, value] = row.split("=");
    key = key.trim();
    value = value.trim();
    if (typeof key === "string" && typeof value === "string" && key.length > 0) parsed[key] = value;
  }
  if (parsed.timestamp) parsed.timestamp = parseInt(parsed.timestamp);
  const worldInfo = parsed as CreateWorldRequestPayload;
  const isWorldInfoValid = isValidCreateWorldRequestPayload(worldInfo);
  if (!isWorldInfoValid) return null;
  const validWorldDirectoryName = worldInfo.timestamp.toString(36);
  if (worldDirectoryName !== validWorldDirectoryName) {
    console.log("Ivalid world data directory:", worldDirectoryName);
    return null;
  }
  if (!isWorldInfoValid) {
    console.log("Invalid world info file:", infoFilePath);
    return null;
  }
  return worldInfo;
};

export const createNewWorldsFromFiles = async function () {
  const worldDirectories = getDirectories(worldDirectoriesPath);
  const worldsFromDatabase = await readWorlds();
  const newWorldDirectories = worldDirectories.filter((worldDirectory) => {
    return worldsFromDatabase.every((world) => {
      return world.startTimestamp.toString(36) !== worldDirectory;
    });
  });
  for (let worldDirectory of newWorldDirectories) {
    const worldInfo = parseWorldInfoFile(worldDirectory);
    if (worldInfo) {
      const isCreated = await createWorld(worldInfo.server, worldInfo.num, worldInfo.domain, worldInfo.timestamp);
      if (isCreated) console.log(`Created a new world from ${worldDirectory} directory`);
      else console.log(`Failed to create a world from ${worldDirectory} directory`);
    }
  }
};
