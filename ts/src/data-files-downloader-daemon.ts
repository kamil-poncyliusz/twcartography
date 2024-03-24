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
  const command = `curl https://${server.domain}/backend/get_servers.php`;
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

const downloadDataFiles = async function (world: WorldListEntry, day: number): Promise<boolean> {
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
      if (server.domain !== null) this.startDownloading({ ...server });
    }
  },
  startDownloading: function (server: Server) {
    if (process.env.RUN_DOWNLOADER_DAEMON !== "true") return;
    const rule = `0 0 ${server.updateHour} * * *`;
    const jobName = server.id.toString();
    this.scheduler.scheduleJob(jobName, rule, async function () {
      const day = Math.floor(Date.now() / 1000 / SECONDS_IN_A_DAY);
      const worldsListString = await getWorldsList(server);
      const worldsList = parseWorldsList(worldsListString);
      const serverWithWorlds = await readServerWithWorlds(server.id);
      if (!serverWithWorlds) return;
      for (let world of worldsList) {
        const isDownloaded = await downloadDataFiles(world, day);
        if (!isDownloaded) console.log(`Error downloading data files for ${world.name}`);
        let worldInDb = serverWithWorlds.worlds.find((w) => w.name === world.name);
        if (!worldInDb) {
          const worldInDb = await createWorld(server.id, world.name);
          if (!worldInDb) {
            console.log(`Error while adding world ${world.name} to the database`);
            continue;
          }
        }
        const parsedData = await parseTurnData(world.name, String(day));
        if (!parsedData) {
          console.log(`Error while parsing data for ${world.name}`);
          continue;
        }
        if (!worldInDb) continue;
        const isTurnDataCreated = await createTurnData(worldInDb.id, day, parsedData);
        if (!isTurnDataCreated) console.log(`Error while adding turn data for ${world.name}`);
      }
    });
  },
  stopDownloading: function (world: World) {
    const jobName = world.id.toString();
    this.scheduler.cancelJob(jobName);
  },
};

export default dataFilesDownloaderDaemon;
