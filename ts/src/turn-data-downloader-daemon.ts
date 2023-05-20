import fs from "fs";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import { createWorldData, readWorlds } from "./queries/index.js";
import worldDataParser from "./world-data-parser.js";
import daysFromStart from "./days-from-start.js";
import { World } from "@prisma/client";

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
  const path = `${process.env.ROOT}/temp/${world.id}`;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  const turnPath = `${path}/${turn}`;
  if (!fs.existsSync(path)) fs.mkdirSync(turnPath);
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

const turnDataDownloaderDaemon = async function () {
  const worlds = await readWorlds();
  for (let world of worlds) {
    const serverStart = new Date(world.start_timestamp * 1000);
    const rule = `${serverStart.getMinutes()} ${serverStart.getHours()} * * *`;
    scheduler.scheduleJob(rule, async function () {
      const turn = daysFromStart(serverStart);
      const success = await downloadWorldData(world, turn);
      if (success) {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} completed`);
        const parsedWorldData = worldDataParser(world.id, turn);
        const createdWorldData = await createWorldData(world.id, turn, parsedWorldData);
        if (createdWorldData !== null)
          console.log(`Turn data created for ${createdWorldData.turn} turn of ${world.server + world.num}`);
        else console.log(`Failed to create turn data record in database`);
      } else {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} failed`);
      }
    });
  }
};

export default turnDataDownloaderDaemon;
