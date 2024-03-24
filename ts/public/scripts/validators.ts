import { GROUP_NAME_FORBIDDEN_CHARACTERS, VALID_USER_RANKS } from "./constants.js";
import { Caption, MarkGroup, Settings } from "../../src/types";

const LOGIN_MIN_LENGTH = 2;
const LOGIN_MAX_LENGTH = 15;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30;
const TURN_MIN = 18261;
export const TURN_MAX = 25565;
const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 20;
const MAP_DESCRIPTION_MAX_LENGTH = 200;
const COLLECTION_DESCRIPTION_MAX_LENGTH = 500;
const GROUP_NAME_MIN_LENGTH = 1;
const GROUP_NAME_MAX_LENGTH = 8;
const FRAME_DELAY_MAX_MILISECONDS = 60000;

const settingsMinValues: { [key: string]: number } = {
  legendFontSize: 1,
  outputWidth: 100,
  scale: 1,
  topSpotSize: 2,
};
const settingsMaxValues: { [key: string]: number } = {
  legendFontSize: 10,
  outputWidth: 1000,
  scale: 5,
  topSpotSize: 15,
};

export const settingsLimits = {
  min: settingsMinValues,
  max: settingsMaxValues,
};

const CAPTION_TEXT_MAX_LENGTH = 20;
const CAPTION_MAX_FONT_SIZE = 200;
const CAPTION_MAX_COORDINATE = 5000;

export const isValidId = function (id: number): boolean {
  if (typeof id !== "number" || !Number.isInteger(id) || isNaN(id) || id < 1) return false;
  return true;
};

export const isValidTitle = function (title: string): boolean {
  if (typeof title !== "string" || title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) return false;
  return true;
};

export const isValidCollectionDescription = function (description: string): boolean {
  if (typeof description !== "string" || description.length > COLLECTION_DESCRIPTION_MAX_LENGTH) return false;
  return true;
};

export const isValidFrameInterval = function (frameInterval: number): boolean {
  if (typeof frameInterval !== "number" || isNaN(frameInterval) || frameInterval < 1 || frameInterval > FRAME_DELAY_MAX_MILISECONDS) return false;
  return true;
};

export const isValidMapDescription = function (description: string): boolean {
  if (typeof description !== "string" || description.length > MAP_DESCRIPTION_MAX_LENGTH) return false;
  return true;
};

export const isValidLogin = function (login: string): boolean {
  if (typeof login !== "string" || login.length < LOGIN_MIN_LENGTH || login.length > LOGIN_MAX_LENGTH) return false;
  return true;
};

export const isValidPassword = function (password: string): boolean {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) return false;
  return true;
};

export const isValidUserRank = function (rank: number): boolean {
  if (typeof rank !== "number" || !VALID_USER_RANKS.includes(rank)) return false;
  return true;
};

export const isValidDayTimestamp = function (input: number): boolean {
  if (typeof input !== "number" || isNaN(input) || !Number.isInteger(input) || input < TURN_MIN || input > TURN_MAX) return false;
  return true;
};

export const isValidTimestamp = function (input: number): boolean {
  if (typeof input !== "number" || isNaN(input) || !Number.isInteger(input) || input < 0) return false;
  return true;
};

export const isValidColor = function (input: string): boolean {
  if (typeof input != "string") return false;
  const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
  return regex.test(input);
};

export const isValidGroupName = function (input: string): boolean {
  if (typeof input !== "string" || input.length < GROUP_NAME_MIN_LENGTH || input.length > GROUP_NAME_MAX_LENGTH) return false;
  for (let i = 0; i < input.length; i++) {
    for (let char = 0; char < GROUP_NAME_FORBIDDEN_CHARACTERS.length; char++) {
      if (input[i] === GROUP_NAME_FORBIDDEN_CHARACTERS[char]) return false;
    }
  }
  return true;
};

export const isValidOutputWidth = function (input: number): boolean {
  if (typeof input !== "number" || !Number.isInteger(input) || input < settingsLimits.min.outputWidth || input > settingsLimits.max.outputWidth)
    return false;
  return true;
};

export const isValidScale = function (input: number): boolean {
  if (typeof input !== "number" || !Number.isInteger(input) || input < settingsLimits.min.scale || input > settingsLimits.max.scale) return false;
  return true;
};

export const isValidTopSpotSize = function (input: number): boolean {
  if (typeof input !== "number" || !Number.isInteger(input) || input < settingsLimits.min.topSpotSize || input > settingsLimits.max.topSpotSize)
    return false;
  return true;
};

export const isValidLegendFontSize = function (input: number): boolean {
  if (typeof input !== "number" || !Number.isInteger(input) || input < settingsLimits.min.legendFontSize || input > settingsLimits.max.legendFontSize)
    return false;
  return true;
};

export const isValidSettings = function (settings: Settings): boolean {
  if (typeof settings !== "object") return false;
  if (!isValidColor(settings.backgroundColor)) return false;
  if (!isValidColor(settings.borderColor)) return false;
  if (typeof settings.drawBorders !== "boolean") return false;
  if (typeof settings.drawLegend !== "boolean") return false;
  if (!isValidLegendFontSize(settings.legendFontSize)) return false;
  if (!isValidOutputWidth(settings.outputWidth)) return false;
  if (!isValidScale(settings.scale)) return false;
  if (typeof settings.smoothBorders !== "boolean") return false;
  if (!isValidTopSpotSize(settings.topSpotSize)) return false;
  if (typeof settings.trim !== "boolean") return false;
  const tribes: string[] = [];
  for (const group of settings.markGroups) {
    if (!isValidMarkGroup(group)) return false;
    tribes.push(...group.tribes);
  }
  const groupNames = settings.markGroups.map((markGroup) => markGroup.name);
  const uniqueGroupNames = new Set(groupNames);
  if (groupNames.length > uniqueGroupNames.size) return false;
  const uniqueTribes = new Set(tribes);
  if (tribes.length > uniqueTribes.size) return false;
  return true;
};

export const isValidCaption = function (caption: Caption): boolean {
  if (!isValidCaptionText(caption.text)) return false;
  if (!isValidColor(caption.color)) return false;
  if (!isValidCaptionFontSize(caption.fontSize)) return false;
  if (!isValidCaptionCoordinate(caption.x)) return false;
  if (!isValidCaptionCoordinate(caption.y)) return false;
  return true;
};

export const isValidCaptionText = function (captionText: string): boolean {
  if (typeof captionText !== "string" || captionText.length === 0 || captionText.length > CAPTION_TEXT_MAX_LENGTH) return false;
  return true;
};

export const isValidCaptionFontSize = function (captionFontSize: number): boolean {
  if (typeof captionFontSize !== "number" || captionFontSize <= 0 || captionFontSize > CAPTION_MAX_FONT_SIZE) return false;
  return true;
};

export const isValidCaptionCoordinate = function (captionCoordinate: number): boolean {
  if (typeof captionCoordinate !== "number" || captionCoordinate < 0 || captionCoordinate > CAPTION_MAX_COORDINATE) return false;
  return true;
};

export const isValidMarkGroup = function (markGroup: MarkGroup): boolean {
  if (typeof markGroup !== "object") return false;
  if (Object.keys(markGroup).length !== 3) return false;
  if (!isValidColor(markGroup.color)) return false;
  if (!isValidGroupName(markGroup.name)) return false;
  if (!Array.isArray(markGroup.tribes)) return false;
  const areTribeIdsValid = markGroup.tribes.every((tribeId) => typeof tribeId === "string" && Number.isInteger(parseInt(tribeId)));
  if (!areTribeIdsValid) return false;
  return true;
};

export const isValidDomain = function (domain: string): boolean {
  if (typeof domain !== "string") return false;
  const regex = new RegExp("^([a-z]+|([a-z]+[-][a-z]+))+([.][a-z]{2,5}){1,2}$");
  return true;
};
