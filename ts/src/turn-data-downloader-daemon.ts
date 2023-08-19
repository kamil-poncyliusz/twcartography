import fs from "fs";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import { createTurnData, readWorlds } from "./queries/index.js";
import parseTurnData from "./parse-turn-data.js";
import daysFromStart from "./days-from-start.js";
import { World } from "@prisma/client";
import { isValidTurn } from "../public/scripts/validators.js";

const downloadWorldDataFile = function (url: string, path: string, filename: string) {
  const dl = new DownloaderHelper(url, path, {
    fileName: `${filename}.txt.gz`,
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
      console.log("DOwnload failed ", err);
      reject();
    });
  });
};
const downloadWorldData = async function (world: World, turn: number) {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const worldDirectoryName = world.startTimestamp.toString(36);
  const path = `${process.env.ROOT}/temp/${worldDirectoryName}`;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  const turnPath = `${path}/${turn}`;
  if (!fs.existsSync(turnPath)) fs.mkdirSync(turnPath);
  const downloadPromises = files.map((file) => {
    const url = `https://${world.server}${world.num}.${world.domain}/map/${file}.txt.gz`;
    return downloadWorldDataFile(url, turnPath, file);
  });
  try {
    await Promise.all(downloadPromises);
    return true;
  } catch {
    return false;
  }
};

const turnDataDownloaderDaemon = {
  scheduler: scheduler,
  init: async function () {
    const worlds = await readWorlds();
    for (let world of worlds) {
      this.startDownloading({ ...world });
    }
  },
  startDownloading: function (world: World) {
    if (process.env.RUN_DOWNLOADER_DAEMON !== "true") return;
    const serverStart = new Date(world.startTimestamp * 1000);
    const rule = `${serverStart.getMinutes()} ${serverStart.getHours()} * * *`;
    const jobName = world.id.toString();
    this.scheduler.scheduleJob(jobName, rule, async function () {
      const turn = daysFromStart(serverStart);
      const worldDirectoryName = world.startTimestamp.toString(36);
      if (!isValidTurn(turn)) return;
      const success = await downloadWorldData(world, turn);
      if (success) {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} completed`);
        const parsedWorldData = parseTurnData(worldDirectoryName, turn);
        const isCreated = await createTurnData(world.id, turn, parsedWorldData);
        if (isCreated) console.log(`Turn data created for ${turn} turn of ${world.server + world.num}`);
        else console.log(`Failed to create turn data record in database`);
      } else {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} failed`);
      }
    });
  },
  stopDownloading: function (world: World) {
    const jobName = world.id.toString();
    this.scheduler.cancelJob(jobName);
  },
};

export default turnDataDownloaderDaemon;
