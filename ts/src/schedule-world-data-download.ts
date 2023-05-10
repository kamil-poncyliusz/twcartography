import fs from "fs";
import scheduler from "node-schedule";
import { DownloaderHelper } from "node-downloader-helper";
import { World } from "@prisma/client";
import { createWorldData, readWorlds } from "./queries/index.js";
import worldDataParser from "./world-data-parser.js";
import daysFromStart from "./days-from-start.js";

const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];

function downloadWorldDataFile(url: string, path: string, filename: string) {
  const dl = new DownloaderHelper(url, path, {
    fileName: `${filename}.txt.gz`,
  });
  return new Promise<void>((resolve, reject) => {
    dl.on("end", () => {
      console.log("Download Completed for", filename);
      resolve();
    });
    dl.on("error", (err) => {
      console.log("Download Failed", err);
      reject();
    });
    dl.start().catch((err) => {
      console.log("Error", err);
      reject();
    });
  });
}
async function downloadWorldData(world: World, turn: number) {
  const files = ["village", "player", "ally", "conquer", "kill_all_tribe", "kill_att_tribe", "kill_def_tribe"];
  const path = `${process.env.ROOT}/temp/${world.id}`;
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  const turnPath = `${path}/${turn}`;
  fs.mkdirSync(turnPath);
  const promises = files.map((file) => {
    const url = `https://${world.server}${world.num}.${world.domain}/map/${file}.txt.gz`;
    return downloadWorldDataFile(url, turnPath, file);
  });
  try {
    await Promise.all(promises);
    return true;
  } catch {
    return false;
  }
}

const scheduleWorldDataDownload = async function () {
  const worlds = await readWorlds();
  for (let world of worlds) {
    const serverStart = new Date(world.start_timestamp * 1000);
    const rule = `${serverStart.getMinutes()} ${serverStart.getHours()} * * *`;
    scheduler.scheduleJob(rule, async function () {
      let turn = daysFromStart(serverStart);
      const result = await downloadWorldData(world, turn);
      if (result) {
        console.log(`Downloading turn ${turn} of ${world.server}.${world.num} completed`);
        const parsedWorldData = worldDataParser(world.id, turn);
        const createdWorldData = await createWorldData(world.id, turn, parsedWorldData);
        if (createdWorldData)
          console.log(`World_data created: (world:${createdWorldData.world_id},turn:${createdWorldData.turn})`);
      } else {
        console.log(`Downloading turn ${turn} of ${world.server}${world.num} failed`);
      }
    });
  }
};

// const worldDataDownloader = async function () {
//   const temp = `${process.env.ROOT}/temp`;
//   const worlds = await readWorlds();
//   for (let world of worlds) {
//     const { id, server, num, start_timestamp, domain } = world;
//     const date = new Date(start_timestamp * 1000);
//     const rule = `${date.getMinutes()} ${date.getHours()} * * *`;
//     scheduler.scheduleJob(rule, async function () {
//       let turn = daysFromStart(date);
//       const tempPath = `temp/${id}`;
//       let path = `${tempPath}/${turn}`;
//       if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
//       fs.mkdirSync(`${tempPath}/${turn}`);
//       let url, dl;
//       for (let file of files) {
//         url = `https://${server}${num}.${domain}/map/${file}.txt.gz`;
//         dl = new DownloaderHelper(url, path, {
//           fileName: `${file}.txt.gz`,
//         });
//         dl.on("end", () => console.log("Download Completed for", file));
//         dl.on("error", (err) => {
//           console.log("Download Failed", err);
//         });
//         await dl.start().catch((err) => {
//           console.log("Error", err);
//         });
//       }
//       console.log("Downloading finished");
//       parseWorldData(id, turn);
//     });
//   }
// };

export default scheduleWorldDataDownload;