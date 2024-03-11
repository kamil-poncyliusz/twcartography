import fs from "fs/promises";
import { isValidCreateWorldRequestPayload } from "../public/scripts/requests-validators.js";
import { CreateWorldRequestPayload } from "./types";

export const getWorldDirectoryName = function (timestamp: number) {
  return timestamp.toString(36);
};

const getWorldInfoFileString = function (payload: CreateWorldRequestPayload): string {
  const fileString = Object.entries(payload)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  return fileString;
};

export const getDirectories = async function (path: string): Promise<string[]> {
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
  const worldDirectoryPath = `${process.env.ROOT}/temp/${worldDirectoryName}`;
  const worldDirectoryInfoFilePath = `${worldDirectoryPath}/info`;
  const fileString = getWorldInfoFileString(payload);
  try {
    await fs.mkdir(worldDirectoryPath, { recursive: true });
    await fs.rm(worldDirectoryInfoFilePath, { force: true });
    await fs.writeFile(worldDirectoryInfoFilePath, fileString);
    return true;
  } catch (error) {
    console.error(`Error creating world directory: ${error}`);
    return false;
  }
};

export const deleteWorldDirectory = async function (worldDirectoryName: string) {
  const pathToDelete = `temp/${worldDirectoryName}`;
  try {
    await fs.access(pathToDelete);
    await fs.rm(pathToDelete, { recursive: true, force: true });
  } catch (error) {
    console.log(error);
  }
};

export const parseWorldInfoFile = async function (worldDirectoryName: string): Promise<CreateWorldRequestPayload | null> {
  const infoFilePath = `temp/${worldDirectoryName}/info`;
  try {
    await fs.access(infoFilePath);
    const fileContents = await fs.readFile(infoFilePath);
    const fileRows = fileContents.toString().split("\n");
    const parsed: { [key: string]: any } = {};
    for (let row of fileRows) {
      let [key, value] = row.split("=");
      if (key && value && key.length > 0) parsed[key.trim()] = value.trim();
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

export const areDataFilesAvailable = async function (worldDirectoryName: string, turn: number): Promise<boolean> {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const dataFilesPath = `temp/${worldDirectoryName}/${turn}`;
  for (const file of files) {
    const dataFilePath = `${dataFilesPath}/${file}.txt.gz`;
    const conquerDataFilePath = `${dataFilesPath}/${file}.txt`;
    const filePath = file === "conquer" ? conquerDataFilePath : dataFilePath;
    try {
      await fs.access(filePath);
    } catch {
      if (file !== "conquer") return false;
      try {
        await fs.access(dataFilePath);
      } catch {
        return false;
      }
    }
  }
  return true;
};
