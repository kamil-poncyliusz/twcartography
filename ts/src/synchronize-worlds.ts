import fs from "fs/promises";
import { CreateWorldRequestPayload } from "./Types";
import { isValidCreateWorldRequestPayload } from "../public/scripts/validators.js";
import { createWorld, readWorlds } from "./queries/index.js";

const worldDirectoriesPath = "temp";

const getDirectories = async function (path: string): Promise<string[]> {
  try {
    const entities = await fs.readdir(path, { withFileTypes: true });
    const directories = entities.filter((entity) => entity.isDirectory());
    const directoryNames = directories.map((directory) => directory.name);
    return directoryNames;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const parseWorldInfoFile = async function (worldDirectoryName: string): Promise<CreateWorldRequestPayload | null> {
  const infoFilePath = `${worldDirectoriesPath}/${worldDirectoryName}/info`;
  try {
    await fs.access(infoFilePath);
    const fileContents = await fs.readFile(infoFilePath);
    const fileRows = fileContents.toString().split("\n");
    const parsed: { [key: string]: any } = {};
    for (let row of fileRows) {
      let [key, value] = row.split("=");
      if (typeof key === "string" && typeof value === "string" && key.length > 0) parsed[key.trim()] = value.trim();
    }
    if (parsed.timestamp) parsed.timestamp = parseInt(parsed.timestamp);
    const worldInfo = parsed as CreateWorldRequestPayload;
    const isWorldInfoValid = isValidCreateWorldRequestPayload(worldInfo);
    if (!isWorldInfoValid) {
      console.log("Invalid world info file:", infoFilePath);
      return null;
    }
    const validWorldDirectoryName = worldInfo.timestamp.toString(36);
    if (worldDirectoryName !== validWorldDirectoryName) {
      console.log("Ivalid world data directory:", worldDirectoryName);
      return null;
    }
    return worldInfo;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createNewWorldsFromFiles = async function () {
  const worldDirectories = await getDirectories(worldDirectoriesPath);
  const worldsFromDatabase = await readWorlds();
  const newWorldDirectories = worldDirectories.filter((worldDirectory) => {
    return worldsFromDatabase.every((world) => {
      return world.startTimestamp.toString(36) !== worldDirectory;
    });
  });
  for (let worldDirectory of newWorldDirectories) {
    const worldInfo = await parseWorldInfoFile(worldDirectory);
    if (!worldInfo) return;
    const isWorldCreated = await createWorld(worldInfo.server, worldInfo.num, worldInfo.domain, worldInfo.timestamp);
    if (isWorldCreated) console.log(`Created a new world from ${worldDirectory} directory`);
    else console.log(`Failed to create a world from ${worldDirectory} directory`);
  }
};
