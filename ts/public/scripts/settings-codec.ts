import { Base64 } from "./base64.js";
import { Caption, MarkGroup, Settings } from "../../src/types.js";
import { defaultSettings } from "./class/generator-controller.js";
import {
  isValidCaption,
  isValidColor,
  isValidId,
  isValidLegendFontSize,
  isValidMarkGroup,
  isValidOutputWidth,
  isValidScale,
  isValidTopSpotSize,
  isValidTurn,
} from "./validators.js";

const minorSeparator = ",";
const majorSeparator = ";";

// export const encodeSettings = function (settings: Settings): string {
//   let result = "";
//   if (settings.markGroups.length === 0) {
//     return result;
//   }
//   for (const group of settings.markGroups) {
//     result += group.name + minorSeparator + group.color;
//     for (const tribeId of group.tribes) {
//       result += minorSeparator + tribeId;
//     }
//     result += majorSeparator;
//   }
//   result += majorSeparator;
//   result += settings.backgroundColor + minorSeparator;
//   result += settings.borderColor + minorSeparator;
//   result += "x" + minorSeparator;
//   result += settings.outputWidth + minorSeparator;
//   result += settings.scale + minorSeparator;
//   result += "x" + minorSeparator;
//   result += Number(settings.trim) + minorSeparator;
//   result += settings.turn + minorSeparator;
//   result += "x" + minorSeparator;
//   result += settings.world + minorSeparator;
//   result += settings.topSpotSize;
//   result += majorSeparator;
//   for (const caption of settings.captions) {
//     result +=
//       majorSeparator +
//       caption.color +
//       minorSeparator +
//       String(caption.fontSize) +
//       minorSeparator +
//       caption.text +
//       minorSeparator +
//       String(caption.x) +
//       minorSeparator +
//       String(caption.y);
//   }
//   const encoded = Base64.encode(result);
//   return encodeURIComponent(encoded);
// };

// export const decodeSettings = function (input: string): Settings | false {
//   if (input === "") return false;
//   const decodedURI = decodeURIComponent(input);
//   let string = "";
//   try {
//     string = Base64.decode(decodedURI);
//   } catch {
//     return false;
//   }
//   const markGroups: MarkGroup[] = [];
//   const captions: Caption[] = [];
//   const [markGroupsString, settingsString, captionsString] = string.split(majorSeparator + majorSeparator);
//   if (markGroupsString === "" || !markGroupsString || settingsString === "" || !settingsString) return false;
//   const markGroupsArray = markGroupsString.split(majorSeparator);
//   const settingsArray = settingsString.split(minorSeparator);
//   const captionsArray = captionsString ? captionsString.split(majorSeparator) : [];
//   for (const markGroup of markGroupsArray) {
//     const groupArray = markGroup.split(minorSeparator);
//     const group: MarkGroup = {
//       name: groupArray[0],
//       color: groupArray[1],
//       tribes: groupArray.slice(2),
//     };
//     markGroups.push(group);
//   }
//   for (const captionString of captionsArray) {
//     const captionArray = captionString.split(minorSeparator);
//     const caption: Caption = {
//       color: captionArray[0],
//       fontSize: parseInt(captionArray[1]),
//       text: captionArray[2],
//       x: parseInt(captionArray[3]),
//       y: parseInt(captionArray[4]),
//     };
//     captions.push(caption);
//   }
//   const [backgroundColor, borderColor, displayUnmarked, outputWidth, scale, spotsFilter, trim, turn, unmarkedColor, world, topSpotSize] =
//     settingsArray;
//   const result: Settings = {
//     backgroundColor: backgroundColor,
//     borderColor: borderColor,
//     captions: captions,
//     markGroups: markGroups,
//     outputWidth: parseInt(outputWidth),
//     scale: parseInt(scale),
//     topSpotSize: parseInt(topSpotSize ? topSpotSize : "8"),
//     trim: parseInt(trim) === 1 ? true : false,
//     turn: parseInt(turn),
//     world: parseInt(world),
//   };
//   return result;
// };

export const encodeJsonSettings = function (settings: Settings): string {
  return JSON.stringify(settings);
};

export const decodeJsonSettings = function (stringifiedSettings: string): Settings {
  const resultSettings = { ...defaultSettings };
  resultSettings.captions = [];
  resultSettings.markGroups = [];
  if (typeof stringifiedSettings !== "string") return resultSettings;
  try {
    const parsedSettings: Settings = JSON.parse(stringifiedSettings);
    if (isValidColor(parsedSettings.backgroundColor)) resultSettings.backgroundColor = parsedSettings.backgroundColor;
    if (isValidColor(parsedSettings.borderColor)) resultSettings.borderColor = parsedSettings.borderColor;
    if (typeof parsedSettings.drawBorders === "boolean") resultSettings.drawBorders = parsedSettings.drawBorders;
    if (typeof parsedSettings.drawLegend === "boolean") resultSettings.drawLegend = parsedSettings.drawLegend;
    if (isValidLegendFontSize(parsedSettings.legendFontSize)) resultSettings.legendFontSize = parsedSettings.legendFontSize;
    if (isValidOutputWidth(parsedSettings.outputWidth)) resultSettings.outputWidth = parsedSettings.outputWidth;
    if (isValidScale(parsedSettings.scale)) resultSettings.scale = parsedSettings.scale;
    if (typeof parsedSettings.smoothBorders === "boolean") resultSettings.smoothBorders = parsedSettings.smoothBorders;
    if (isValidTopSpotSize(parsedSettings.topSpotSize)) resultSettings.topSpotSize = parsedSettings.topSpotSize;
    if (typeof parsedSettings.trim === "boolean") resultSettings.trim = parsedSettings.trim;
    if (isValidTurn(parsedSettings.turn)) resultSettings.turn = parsedSettings.turn;
    if (isValidId(parsedSettings.world)) resultSettings.world = parsedSettings.world;
    if (Array.isArray(parsedSettings.markGroups)) {
      parsedSettings.markGroups.forEach((markGroup) => {
        if (isValidMarkGroup(markGroup)) resultSettings.markGroups.push(markGroup);
      });
    }
    if (Array.isArray(parsedSettings.captions)) {
      parsedSettings.captions.forEach((caption) => {
        if (isValidCaption(caption)) resultSettings.captions.push(caption);
      });
    }
    return resultSettings;
  } catch (error) {
    return resultSettings;
  }
};
