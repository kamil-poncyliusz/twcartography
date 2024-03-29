import { exec } from "child_process";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import { Server, World } from "@prisma/client";
import { readServerWithWorlds, readServers } from "./queries/server.js";
import { createDirectory, getDataFilesDirectoryPath } from "./data-files-directory-handlers.js";
import { createWorld } from "./queries/world.js";
import parseTurnData from "./parse-turn-data.js";
import { createTurnData } from "./queries/turn-data.js";
import { parseAvailableTurnData } from "./world-data-state.js";

const downloadDataFile = function (url: string, path: string, file: string) {
  const fileName = file === "conquer" ? `${file}.txt` : `${file}.txt.gz`;
  const dl = new DownloaderHelper(url, path, {
    fileName: fileName,
  });
  return new Promise<void>((resolve, reject) => {
    dl.on("end", () => {
      resolve();
    });
    dl.on("error", (err) => {
      console.log("Download failed ", err);
      reject();
    });
    dl.start().catch((err) => {
      console.log("Download failed ", err);
      reject();
    });
  });
};

const getWorldsList = async function (server: Server): Promise<string> {
  if (!server.domain) return "";
  const command = `curl https://www.${server.domain}/backend/get_servers.php`;
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while getting worlds list: ${error}`);
        resolve("");
      }
      resolve(stdout);
    });
  });
};

interface WorldListEntry {
  name: string;
  adress: string;
}

const parseWorldsList = function (worldsListString: string): WorldListEntry[] {
  const regex = /s:\d+:"([^"]+)";s:\d+:"([^"]+)";/g;
  const matches = worldsListString.matchAll(regex);
  const result: WorldListEntry[] = [];
  for (const match of matches) {
    result.push({ name: match[1], adress: match[2] });
  }
  return result;
};

const SECONDS_IN_A_DAY = 24 * 60 * 60;
const MARGIN = 15;

const getDataFileUrl = (world: WorldListEntry, file: string): string => {
  if (file !== "conquer") return `${world.adress}/map/${file}.txt.gz`;
  const dayAgoTimestamp = Math.ceil(Date.now() / 1000 - SECONDS_IN_A_DAY + MARGIN);
  return `${world.adress}/interface.php?func=get_conquer&since=${dayAgoTimestamp}`;
};

const downloadDataFiles = async function (world: WorldListEntry, day: string): Promise<boolean> {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const directoryPath = getDataFilesDirectoryPath(world.name, day);
  const isDirectoryCreated = await createDirectory(directoryPath);
  if (!isDirectoryCreated) return false;
  const downloadPromises = files.map((file) => {
    const url = getDataFileUrl(world, file);
    return downloadDataFile(url, directoryPath, file);
  });
  try {
    await Promise.all(downloadPromises);
    return true;
  } catch (error) {
    console.error(`Error downloading world data files: ${error}`);
    return false;
  }
};

const dataFilesDownloaderDaemon = {
  scheduler: scheduler,
  init: async function () {
    await parseAvailableTurnData();
    const servers = await readServers();
    for (let server of servers) {
      this.startDownloading({ ...server });
    }
  },
  startDownloading: function (server: Server) {
    if (process.env.RUN_DOWNLOADER_DAEMON !== "true") return;
    if (server.domain === null) return;
    const rule = `0 0 ${server.updateHour} * * *`;
    const jobName = server.name;
    console.log(`Daemon: Downloading for server ${server.name} set at hour ${server.updateHour}`);
    this.scheduler.scheduleJob(jobName, rule, async function () {
      console.log(`Daemon: Downloading data files for server ${server.name}`);
      const date = new Date();
      const day = date.toISOString().split("T")[0];
      const worldsListString = await getWorldsList(server);
      const worldsList = parseWorldsList(worldsListString);
      const serverWithWorlds = await readServerWithWorlds(server.id);
      if (!serverWithWorlds) return;
      for (let world of worldsList) {
        const isDownloaded = await downloadDataFiles(world, day);
        if (!isDownloaded) continue;
        let worldInDatabase = serverWithWorlds.worlds.find((w) => w.name === world.name);
        if (!worldInDatabase) {
          const createdWorld = await createWorld(server.id, world.name);
          if (createdWorld) worldInDatabase = createdWorld;
          else {
            console.log(`Daemon: Error while adding world ${world.name} to the database`);
            continue;
          }
        }
        const parsedData = await parseTurnData(world.name, day);
        if (!parsedData) {
          console.log(`Daemon: Error while parsing data for ${world.name}`);
          continue;
        }
        const isTurnDataCreated = await createTurnData(worldInDatabase.id, day, parsedData);
        if (!isTurnDataCreated) console.log(`Daemon: Error while adding world ${world.name} turn data to the database`);
      }
      console.log(`Daemon: Downloading data files for server ${server.name} finished`);
    });
  },
  stopDownloading: function (server: Server) {
    const jobName = server.name;
    this.scheduler.cancelJob(jobName);
  },
};

export default dataFilesDownloaderDaemon;
