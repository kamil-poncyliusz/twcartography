import fs from "fs/promises";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import parseTurnData from "./parse-turn-data.js";
import { isValidTurn } from "../public/scripts/validators.js";
import { createTurnData } from "./queries/turn-data.js";
import { readWorlds } from "./queries/world.js";
import { World } from "@prisma/client";

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

const downloadWorldData = async function (world: World, turn: number) {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const worldDirectoryName = world.startTimestamp.toString(36);
  const turnDirectoryPath = `${process.env.ROOT}/temp/${worldDirectoryName}/${turn}`;
  try {
    await fs.access(turnDirectoryPath);
  } catch {
    await fs.mkdir(turnDirectoryPath, { recursive: true });
  }
  const downloadPromises = files.map((file) => {
    let url = `https://${world.server}${world.num}.${world.domain}/map/${file}.txt.gz`;
    if (file === "conquer") {
      const secondsInADay = 24 * 60 * 60;
      const margin = 15;
      const dayAgoTimestamp = Math.ceil(Date.now() / 1000 - secondsInADay + margin);
      url = `https://${world.server}${world.num}.${world.domain}/interface.php?func=get_conquer&since=${dayAgoTimestamp}`;
    }
    return downloadWorldDataFile(url, turnDirectoryPath, file);
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
    const serverStartTimestamp = new Date(world.startTimestamp * 1000);
    const serverStartSeconds = serverStartTimestamp.getSeconds();
    const serverStartMinutes = serverStartTimestamp.getMinutes();
    const serverStartHours = serverStartTimestamp.getHours();
    const rule = `${serverStartSeconds} ${serverStartMinutes} ${serverStartHours} * * *`;
    const jobName = world.id.toString();
    this.scheduler.scheduleJob(jobName, rule, async function () {
      const turn = Math.round(Date.now() - serverStartTimestamp.getTime() / 1000 / 60 / 60 / 24);
      const worldDirectoryName = world.startTimestamp.toString(36);
      if (!isValidTurn(turn)) return console.log(`Downloader daemon: ${turn} is not a valid turn`);
      const success = await downloadWorldData(world, turn);
      if (success) {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} completed`);
        const parsedWorldData = await parseTurnData(worldDirectoryName, turn);
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
