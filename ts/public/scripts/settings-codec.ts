import { Base64 } from "./base64.js";
import { Caption, MarkGroup, Settings } from "../../src/types.js";

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
  result += settings.borderColor + minorSeparator;
  result += "x" + minorSeparator;
  result += settings.outputWidth + minorSeparator;
  result += settings.scale + minorSeparator;
  result += "x" + minorSeparator;
  result += Number(settings.trim) + minorSeparator;
  result += settings.turn + minorSeparator;
  result += "x" + minorSeparator;
  result += settings.world + minorSeparator;
  result += settings.topSpotSize;
  result += majorSeparator;
  for (const caption of settings.captions) {
    result +=
      majorSeparator +
      caption.color +
      minorSeparator +
      String(caption.fontSize) +
      minorSeparator +
      caption.text +
      minorSeparator +
      String(caption.x) +
      minorSeparator +
      String(caption.y);
  }
  const encoded = Base64.encode(result);
  return encodeURIComponent(encoded);
};

export const decodeSettings = function (input: string): Settings | false {
  if (input === "") return false;
  const decodedURI = decodeURIComponent(input);
  let string = "";
  try {
    string = Base64.decode(decodedURI);
  } catch {
    return false;
  }
  const markGroups: MarkGroup[] = [];
  const captions: Caption[] = [];
  const [markGroupsString, settingsString, captionsString] = string.split(majorSeparator + majorSeparator);
  if (markGroupsString === "" || !markGroupsString || settingsString === "" || !settingsString) return false;
  const markGroupsArray = markGroupsString.split(majorSeparator);
  const settingsArray = settingsString.split(minorSeparator);
  const captionsArray = captionsString ? captionsString.split(majorSeparator) : [];
  for (const markGroup of markGroupsArray) {
    const groupArray = markGroup.split(minorSeparator);
    const group: MarkGroup = {
      name: groupArray[0],
      color: groupArray[1],
      tribes: groupArray.slice(2),
    };
    markGroups.push(group);
  }
  for (const captionString of captionsArray) {
    const captionArray = captionString.split(minorSeparator);
    const caption: Caption = {
      color: captionArray[0],
      fontSize: parseInt(captionArray[1]),
      text: captionArray[2],
      x: parseInt(captionArray[3]),
      y: parseInt(captionArray[4]),
    };
    captions.push(caption);
  }
  const [backgroundColor, borderColor, displayUnmarked, outputWidth, scale, spotsFilter, trim, turn, unmarkedColor, world, topSpotSize] =
    settingsArray;
  const result: Settings = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    captions: captions,
    markGroups: markGroups,
    outputWidth: parseInt(outputWidth),
    scale: parseInt(scale),
    topSpotSize: parseInt(topSpotSize ? topSpotSize : "8"),
    trim: parseInt(trim) === 1 ? true : false,
    turn: parseInt(turn),
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

export const decodeJsonSettings = function (input: string): Settings | false {
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
