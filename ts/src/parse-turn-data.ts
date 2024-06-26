import fs from "fs/promises";
import zlib from "zlib";
import { ParsedTurnData } from "./types";

const CENTER_POINT = 500;
const MARGIN = 2;
const ROUNDING_FACTOR = 10;

const calculateMinWidth = function (data: ParsedTurnData) {
  let maxDistance = 0;
  for (let tribeId in data.tribes) {
    const tribe = data.tribes[tribeId];
    for (const village of tribe.villages) {
      const distanceX = Math.abs(CENTER_POINT - village.x);
      const distanceY = Math.abs(CENTER_POINT - village.y);
      maxDistance = Math.max(maxDistance, distanceX, distanceY);
    }
  }
  return Math.ceil((maxDistance + MARGIN) / ROUNDING_FACTOR) * ROUNDING_FACTOR * 2;
};

const parseFile = async function (worldName: string, day: string, fileName: string): Promise<string[]> {
  const directoryPath = `data-files/${worldName}/${day}`;
  try {
    if (fileName === "conquer") {
      const fileData = await fs.readFile(`${directoryPath}/${fileName}.txt`);
      let rows = fileData.toString().split(/\r?\n/);
      return rows;
    } else {
      const fileData = await fs.readFile(`${directoryPath}/${fileName}.txt.gz`);
      const unzipped = zlib.unzipSync(fileData);
      let rows = unzipped.toString().split(/\r?\n/);
      rows.splice(-1);
      return rows;
    }
  } catch (error) {
    console.log(`Parsing failed for ${directoryPath}/${fileName}: ${error}`);
    return [];
  }
};

const parseTurnData = async function (worldName: string, day: string): Promise<ParsedTurnData> {
  const parsedData: ParsedTurnData = {
    conquer: {},
    tribes: {},
    width: 1000,
    averageVillagePoints: 0,
    medianVillagePoints: 0,
    topVillagePoints: 0,
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
  const playerTribeIds: { [key: string]: string } = {};
  const tribesData = await parseFile(worldName, day, "ally");
  for (let i = 0; i < tribesData.length; i++) {
    const [id, name, tag, players, villages, points, allPoints, rank] = tribesData[i].split(",");
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
  const playersData = await parseFile(worldName, day, "player");
  for (let i = 0; i < playersData.length; i++) {
    const [id, name, tribeId, villages, points, rank] = playersData[i].split(",");
    playerTribeIds[id] = tribeId;
  }
  const villagesData = await parseFile(worldName, day, "village");
  const villagePointsArray: number[] = [];
  for (let i = 0; i < villagesData.length; i++) {
    const [id, name, x, y, playerId, points, rank] = villagesData[i].split(",");
    const pointsNumber = +points;
    villagePointsArray.push(pointsNumber);
    if (parseInt(playerId) > 0) {
      const tribeId = playerTribeIds[playerId];
      const tribe = parsedData.tribes[tribeId];
      if (tribe === undefined) {
        // console.log("Parser:", tribeId, "village data tribe undefined");
      } else {
        tribe.villages.push({
          tribeId: tribeId,
          x: parseInt(x),
          y: parseInt(y),
          points: pointsNumber,
        });
        if (pointsNumber > parsedData.topVillagePoints) parsedData.topVillagePoints = pointsNumber;
      }
    }
  }
  villagePointsArray.sort((a, b) => b - a);
  const medianIndex = Math.floor(villagePointsArray.length / 2);
  parsedData.medianVillagePoints = villagePointsArray[medianIndex];
  let villagePointsSum = 0;
  for (let i = 0; i < villagePointsArray.length; i++) {
    villagePointsSum += villagePointsArray[i];
  }
  parsedData.averageVillagePoints = Math.round(villagePointsSum / villagePointsArray.length);
  const killAllData = await parseFile(worldName, day, "kill_all_tribe");
  for (let i = 0; i < killAllData.length; i++) {
    const [rank, id, score] = killAllData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      // console.log("Parser:", id, "kill_all tribe undefined");
    } else {
      parsedData.tribes[id].killAll = parseInt(score);
    }
  }
  const killAttData = await parseFile(worldName, day, "kill_att_tribe");
  for (let i = 0; i < killAttData.length; i++) {
    const [rank, id, score] = killAttData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      // console.log("Parser:", id, "kill_att tribe undefined");
    } else {
      parsedData.tribes[id].killAtt = parseInt(score);
    }
  }
  const killDefData = await parseFile(worldName, day, "kill_def_tribe");
  for (let i = 0; i < killDefData.length; i++) {
    const [rank, id, score] = killDefData[i].split(",");
    if (parsedData.tribes[id] === undefined) {
      // console.log("Parser:", id, "kill_def tribe undefined");
    } else {
      parsedData.tribes[id].killDef = parseInt(score);
    }
  }
  const conquerData = await parseFile(worldName, day, "conquer");
  for (let i = 0; i < conquerData.length; i++) {
    const [villageId, timestamp, newOwner, oldOwner] = conquerData[i].split(",");
  }
  parsedData.width = calculateMinWidth(parsedData);
  return parsedData;
};

export default parseTurnData;
