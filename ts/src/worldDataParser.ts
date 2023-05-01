import fs from "fs";
import zlib from "zlib";
import { createWorldData } from "./queries/worldData.js";
import { ParsedTurnData } from "../public/scripts/Types";
import { Prisma } from "@prisma/client";

const parseFile = function (world: number, turn: number, name: string) {
  const path = `temp/${world}/${turn}/${name}.txt.gz`;
  try {
    const fileData = fs.readFileSync(path);
    const unzipped = zlib.unzipSync(fileData);
    let rows = unzipped.toString().split(/\r?\n/);
    rows.splice(-1);
    return rows;
  } catch {
    console.log(`Parsing failed for ${path}`);
    return [];
  }
};

const worldDataParser = function (world_id: number, turn: number) {
  const parsedData: ParsedTurnData = {
    conquer: {},
    tribes: {},
    width: 1000,
  };
  parsedData.tribes["0"] = {
    id: "0",
    name: "",
    tag: "",
    points: 0,
    players: 0,
    killAll: 0,
    killAtt: 0,
    killDef: 0,
    villages: [],
  };
  let fileData;
  const playerTribeIds: { [key: string]: string } = {};
  fileData = parseFile(world_id, turn, "ally");
  for (let i = 0; i < fileData.length; i++) {
    const [id, name, tag, players, villages, points, allPoints, rank] = fileData[i].split(",");
    parsedData.tribes[id] = {
      id: id,
      name: decodeURIComponent(name).replaceAll("+", " "),
      tag: decodeURIComponent(tag).replaceAll("+", " "),
      points: parseInt(points),
      players: parseInt(players),
      villages: [],
      killAll: 0,
      killAtt: 0,
      killDef: 0,
    };
  }
  fileData = parseFile(world_id, turn, "player");
  for (let i = 0; i < fileData.length; i++) {
    const [id, name, tribeId, villages, points, rank] = fileData[i].split(",");
    playerTribeIds[id] = tribeId;
  }
  fileData = parseFile(world_id, turn, "village");
  for (let i = 0; i < fileData.length; i++) {
    const [id, name, x, y, playerId, points, rank] = fileData[i].split(",");
    if (parseInt(playerId) > 0) {
      const tribeId = playerTribeIds[playerId];
      const tribe = parsedData.tribes[tribeId];
      if (tribe === undefined) console.log("Parser:", tribeId, "village data tribe undefined");
      else
        tribe.villages.push({
          tribeId: tribeId,
          x: parseInt(x),
          y: parseInt(y),
          points: parseInt(points),
        });
    }
  }
  fileData = parseFile(world_id, turn, "kill_all_tribe");
  for (let i = 0; i < fileData.length; i++) {
    const [rank, id, score] = fileData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      console.log("Parser:", id, "kill_all tribe undefined");
    } else {
      parsedData.tribes[id].killAll = parseInt(score);
    }
  }
  fileData = parseFile(world_id, turn, "kill_att_tribe");
  for (let i = 0; i < fileData.length; i++) {
    const [rank, id, score] = fileData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      console.log("Parser:", id, "kill_att tribe undefined");
    } else {
      parsedData.tribes[id].killAtt = parseInt(score);
    }
  }
  fileData = parseFile(world_id, turn, "kill_def_tribe");
  for (let i = 0; i < fileData.length; i++) {
    const [rank, id, score] = fileData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      console.log("Parser:", id, "kill_def tribe undefined");
    } else {
      parsedData.tribes[id].killDef = parseInt(score);
    }
  }
  fileData = parseFile(world_id, turn, "conquer");
  for (let i = 0; i < fileData.length; i++) {
    const [id, timestamp, newOwner, oldOwner] = fileData[i].split(",");
  }
  let maxDistance = 0;
  let distance = 0;
  for (let tribeId in parsedData.tribes) {
    const tribe = parsedData.tribes[tribeId];
    for (const village of tribe.villages) {
      distance = Math.abs(500 - village.x);
      if (distance > maxDistance) maxDistance = distance;
      distance = Math.abs(500 - village.y);
      if (distance > maxDistance) maxDistance = distance;
    }
  }
  parsedData.width = Math.ceil((maxDistance + 2) / 10) * 20;
  const inputJsonValue = parsedData as unknown;
  createWorldData(world_id, turn, inputJsonValue as Prisma.InputJsonValue).then((result) => {
    if (result) console.log(`World_data created: (world:${result.world_id},turn:${result.turn})`);
  });
};

export default worldDataParser;
