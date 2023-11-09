import fs from "fs/promises";
import { createWorld, readWorlds } from "./queries/world.js";
import { isValidCreateWorldRequestPayload } from "../public/scripts/requests-validators.js";
import { CreateWorldRequestPayload } from "./types.js";

const worldDirectoriesPath = "temp";

export const getWorldDirectoryName = function (timestamp: number) {
  return timestamp.toString(36);
};

const getWorldInfoFileString = function (payload: CreateWorldRequestPayload): string {
  const fileString = Object.entries(payload)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  return fileString;
};

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

export const createWorldDirectory = async function (payload: CreateWorldRequestPayload): Promise<boolean> {
  const worldDirectoryName = getWorldDirectoryName(payload.startTimestamp);
  const worldDirectoryPath = `${process.env.ROOT}/${worldDirectoriesPath}/${worldDirectoryName}`;
  const worldDirectoryInfoFilePath = `${worldDirectoryPath}/info`;
  const fileString = getWorldInfoFileString(payload);
  try {
    await fs.mkdir(worldDirectoryPath, { recursive: true });
  } catch {
    //
  }
  try {
    await fs.access(worldDirectoryInfoFilePath);
    await fs.unlink(worldDirectoryInfoFilePath);
  } catch {
    //
  }
  try {
    await fs.writeFile(worldDirectoryInfoFilePath, fileString);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const deleteWorldDirectory = async function (worldDirectoryName: string) {
  const pathToDelete = `${worldDirectoriesPath}/${worldDirectoryName}`;
  try {
    await fs.access(pathToDelete);
    await fs.rm(pathToDelete, { recursive: true, force: true });
  } catch (error) {
    console.log(error);
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
    if (parsed.startTimestamp) parsed.startTimestamp = parseInt(parsed.startTimestamp);
    if (parsed.endTimestamp) parsed.endTimestamp = parseInt(parsed.endTimestamp);
    else parsed.endTimestamp = 0;
    const worldInfo = parsed as CreateWorldRequestPayload;
    const isWorldInfoValid = isValidCreateWorldRequestPayload(worldInfo);
    if (!isWorldInfoValid) {
      console.log("Invalid world info file:", infoFilePath);
      return null;
    }
    const validWorldDirectoryName = getWorldDirectoryName(worldInfo.startTimestamp);
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

export const synchronizeTempDirectories = async function () {
  const worldsFromDatabase = await readWorlds();
  for (let world of worldsFromDatabase) {
    const { id: number, ...rest } = world;
    const payload: CreateWorldRequestPayload = rest;
    createWorldDirectory(payload);
  }
  const worldDirectories = await getDirectories(worldDirectoriesPath);
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
