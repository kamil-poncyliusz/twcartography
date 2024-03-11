import fs from "fs/promises";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import parseTurnData from "./parse-turn-data.js";
import { isValidTurn } from "../public/scripts/validators.js";
import { getWorldDirectoryName } from "./temp-directory-handlers.js";
import { createTurnData } from "./queries/turn-data.js";
import { readWorlds } from "./queries/world.js";
import { World } from "@prisma/client";
import { parseAvailableTurnData, synchronizeTempDirectories } from "./world-data-state.js";

const downloadWorldDataFile = function (url: string, path: string, file: string) {
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

const SECONDS_IN_A_DAY = 24 * 60 * 60;
const MARGIN = 15;

const getUrl = (world: World, file: string): string => {
  if (file !== "conquer") return `https://${world.server}${world.num}.${world.domain}/map/${file}.txt.gz`;
  const dayAgoTimestamp = Math.ceil(Date.now() / 1000 - SECONDS_IN_A_DAY + MARGIN);
  return `https://${world.server}${world.num}.${world.domain}/interface.php?func=get_conquer&since=${dayAgoTimestamp}`;
};

const downloadWorldData = async function (world: World, turn: number) {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
  const turnDirectoryPath = `${process.env.ROOT}/temp/${worldDirectoryName}/${turn}`;
  try {
    await fs.access(turnDirectoryPath);
  } catch {
    await fs.mkdir(turnDirectoryPath, { recursive: true });
  }
  const downloadPromises = files.map((file) => {
    const url = getUrl(world, file);
    return downloadWorldDataFile(url, turnDirectoryPath, file);
  });
  try {
    await Promise.all(downloadPromises);
    return true;
  } catch (error) {
    console.error(`Error downloading world data files: ${error}`);
    return false;
  }
};

const turnDataDownloaderDaemon = {
  scheduler: scheduler,
  init: async function () {
    await synchronizeTempDirectories();
    await parseAvailableTurnData();
    const worlds = await readWorlds();
    for (let world of worlds) {
      this.startDownloading({ ...world });
    }
  },
  startDownloading: function (world: World) {
    if (process.env.RUN_DOWNLOADER_DAEMON !== "true") return;
    if (world.endTimestamp > 0) return;
    const serverStartTimestamp = new Date(world.startTimestamp * 1000);
    const rule = `${serverStartTimestamp.getSeconds()} ${serverStartTimestamp.getMinutes()} ${serverStartTimestamp.getHours()} * * *`;
    const jobName = world.id.toString();
    this.scheduler.scheduleJob(jobName, rule, async function () {
      const turn = Math.round((Date.now() - serverStartTimestamp.getTime()) / 1000 / SECONDS_IN_A_DAY);
      const worldDirectoryName = getWorldDirectoryName(world.startTimestamp);
      if (!isValidTurn(turn)) return console.log(`Downloader daemon: ${turn} is not a valid turn`);
      const success = await downloadWorldData(world, turn);
      if (!success) return console.log(`Downloading turn ${turn} of ${world.server}${world.num} failed`);
      console.log(`Downloading turn ${turn} of ${world.server}${world.num} completed`);
      const parsedWorldData = await parseTurnData(worldDirectoryName, turn);
      const isCreated = await createTurnData(world.id, turn, parsedWorldData);
      const successMessage = `Turn data created for ${turn} turn of ${world.server + world.num}`;
      const failedMessage = `Failed to create turn data record in database`;
      console.log(isCreated ? successMessage : failedMessage);
    });
  },
  stopDownloading: function (world: World) {
    const jobName = world.id.toString();
    this.scheduler.cancelJob(jobName);
  },
};

export default turnDataDownloaderDaemon;
