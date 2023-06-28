import { Base64 } from "./base64.js";
import { MarkGroup, Settings } from "../../src/Types.js";

const minorSeparator = ",";
const majorSeparator = ";";

export const encodeSettings = function (settings: Settings): string {
  let result = "";
  if (settings.markGroups.length === 0) {
    return result;
  }
  for (const group of settings.markGroups) {
    result += group.name + minorSeparator + group.color;
    for (const tribeID of group.tribes) {
      result += minorSeparator + tribeID;
    }
    result += majorSeparator;
  }
  result += majorSeparator;
  result += settings.backgroundColor + minorSeparator;
  result += settings.borderColor + minorSeparator;
  result += Number(settings.displayUnmarked) + minorSeparator;
  result += settings.outputWidth + minorSeparator;
  result += settings.scale + minorSeparator;
  result += settings.spotsFilter + minorSeparator;
  result += Number(settings.trim) + minorSeparator;
  result += settings.turn + minorSeparator;
  result += settings.unmarkedColor + minorSeparator;
  result += settings.world;
  const encoded = Base64.encode(result);
  return encodeURIComponent(encoded);
};

export const decodeSettings = function (input: string) {
  if (input === "") return false;
  const decodedURI = decodeURIComponent(input);
  let string = "";
  try {
    string = Base64.decode(decodedURI);
  } catch {
    return false;
  }
  const markGroups: MarkGroup[] = [];
  const [markGroupsString, settingsString] = string.split(majorSeparator + majorSeparator);
  if (markGroupsString === "" || !markGroupsString || settingsString === "" || !settingsString) return false;
  const markGroupsArray = markGroupsString.split(majorSeparator);
  const settingsArray = settingsString.split(minorSeparator);
  for (const markGroup of markGroupsArray) {
    const groupArray = markGroup.split(minorSeparator);
    const group = {
      name: groupArray[0],
      color: groupArray[1],
      tribes: groupArray.slice(2),
    };
    markGroups.push(group);
  }
  if (settingsArray.length < 8) return false;
  const [backgroundColor, borderColor, displayUnmarked, outputWidth, scale, spotsFilter, trim, turn, unmarkedColor, world] = settingsArray;
  const result = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    displayUnmarked: parseInt(displayUnmarked) === 1 ? true : false,
    markGroups: markGroups,
    outputWidth: parseInt(outputWidth),
    scale: parseInt(scale),
    spotsFilter: parseInt(spotsFilter),
    trim: parseInt(trim) === 1 ? true : false,
    turn: parseInt(turn),
    unmarkedColor: unmarkedColor,
    world: parseInt(world),
  };
  return result;
};

export const encodeJsonSettings = function (settings: Settings): string {
  if (settings.markGroups.length === 0) return "";
  const stringified = JSON.stringify(settings);
  const baseEncoded = Base64.encode(stringified);
  return encodeURIComponent(baseEncoded);
};

export const decodeJsonSettings = function (input: string) {
  if (typeof input !== "string") return false;
  const decodedURI = decodeURIComponent(input);
  let string = "";
  try {
    string = Base64.decode(decodedURI);
  } catch {
    return false;
  }
  const settings = JSON.parse(string);
  return settings;
};
