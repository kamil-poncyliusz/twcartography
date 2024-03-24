import fs from "fs/promises";
import { ServerWithWorlds } from "./types";

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

export const getDataFilesDirectoryPath = function (worldName: string, day: number): string {
  return `data-files/${worldName}/${day}`;
};

export const createDirectory = async function (path: string): Promise<boolean> {
  try {
    await fs.mkdir(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating ${path} directory: ${error}`);
    return false;
  }
};

// export const deleteServerDirectory = async function (serverSymbol: string) {
//   const pathToDelete = `temp/${serverSymbol}`;
//   try {
//     await fs.access(pathToDelete);
//     await fs.rm(pathToDelete, { recursive: true, force: true });
//     return true;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

export const areDataFilesAvailable = async function (worldName: string, day: string): Promise<boolean> {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const dataFilesPath = `data-files/${worldName}/${day}`;
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
