import { Base64 } from "./base64.js";
import { MarkGroup, Settings } from "../../Types.js";

export const encodeSettings = function (settings: Settings): string {
  let result = "";
  if (settings.markGroups.length === 0) {
    return result;
  }
  for (const group of settings.markGroups) {
    result += `${group.name}:${group.color}`;
    for (const tribeId of group.tribes) {
      result += `:${tribeId}`;
    }
    result += ";";
  }
  result += "^*";
  result += `${settings.backgroundColor}:`;
  result += `${settings.radius}:`;
  result += `${settings.scale}:`;
  result += `${settings.spotsFilter}:`;
  result += `${settings.spotSize}:`;
  result += `${settings.turn}:`;
  result += `${settings.villageFilter}:`;
  result += `${settings.world}`;
  const encoded = Base64.encode(result);
  return encodeURIComponent(encoded);
};

export const decodeSettings = function (input: string): Settings {
  const defaultSettings: Settings = {
    backgroundColor: "#000000",
    markGroups: [],
    radius: 500,
    scale: 2,
    spotsFilter: 5,
    spotSize: 3,
    turn: -1,
    villageFilter: 1000,
    world: 0,
  };
  if (input === "") return defaultSettings;
  const decodedURI = decodeURIComponent(input);
  const string = Base64.decode(decodedURI);
  const markGroups: MarkGroup[] = [];
  const [markGroupsString, settingsString] = string.split(";^*");
  if (markGroupsString === "" || !markGroupsString || settingsString === "" || !settingsString) return defaultSettings;
  const markGroupsArray = markGroupsString.split(";");
  const settingsArray = settingsString.split(":");
  for (const markGroup of markGroupsArray) {
    const groupArray = markGroup.split(":");
    const group = {
      name: groupArray[0],
      color: groupArray[1],
      tribes: groupArray.slice(2),
    };
    markGroups.push(group);
  }
  if (settingsArray.length < 8) return defaultSettings;
  const [backgroundColor, radius, scale, spotsFilter, spotSize, turn, villageFilter, world] = settingsArray;
  const result = {
    backgroundColor: backgroundColor,
    markGroups: markGroups,
    radius: parseInt(radius),
    scale: parseInt(scale),
    spotsFilter: parseInt(spotsFilter),
    spotSize: parseInt(spotSize),
    turn: parseInt(turn),
    villageFilter: parseInt(villageFilter),
    world: parseInt(world),
  };
  return result;
};
