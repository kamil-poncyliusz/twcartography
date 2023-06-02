import { Base64 } from "./base64.js";
import { MarkGroup, Settings } from "../../Types.js";

const minorSeparator = ",";
const majorSeparator = ";";

export const encodeSettings = function (settings: Settings): string {
  let result = "";
  if (settings.markGroups.length === 0) {
    return result;
  }
  for (const group of settings.markGroups) {
    result += group.name + minorSeparator + group.color;
    for (const tribeId of group.tribes) {
      result += minorSeparator + tribeId;
    }
    result += majorSeparator;
  }
  result += majorSeparator;
  result += settings.backgroundColor + minorSeparator;
  result += Number(settings.displayUnmarked) + minorSeparator;
  result += settings.outputWidth + minorSeparator;
  result += settings.radius + minorSeparator;
  result += settings.scale + minorSeparator;
  result += settings.spotsFilter + minorSeparator;
  result += settings.spotSize + minorSeparator;
  result += settings.trim + minorSeparator;
  result += settings.turn + minorSeparator;
  result += settings.unmarkedColor + minorSeparator;
  result += settings.villageFilter + minorSeparator;
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
  const [
    backgroundColor,
    displayUnmarked,
    outputWidth,
    radius,
    scale,
    spotsFilter,
    spotSize,
    trim,
    turn,
    unmarkedColor,
    villageFilter,
    world,
  ] = settingsArray;
  const result = {
    backgroundColor: backgroundColor,
    displayUnmarked: parseInt(displayUnmarked) === 1 ? true : false,
    markGroups: markGroups,
    outputWidth: parseInt(outputWidth),
    radius: parseInt(radius),
    scale: parseInt(scale),
    spotsFilter: parseInt(spotsFilter),
    spotSize: parseInt(spotSize),
    trim: parseInt(trim) === 1 ? true : false,
    turn: parseInt(turn),
    unmarkedColor: unmarkedColor,
    villageFilter: parseInt(villageFilter),
    world: parseInt(world),
  };
  return result;
};
