import { GROUP_NAME_FORBIDDEN_CHARACTERS, VALID_USER_RANKS } from "./constants.js";
import { CreateMapRequestPayload, CreateWorldRequestPayload, Settings } from "../../src/Types";

export enum CreateMapRequestValidationCode {
  Ok,
  InvalidSettings,
  InvalidTitle,
  InvalidDescription,
  InvalidCollection,
}

const TURN_MAX = 365;
const TURN_MIN = 0;
const GROUP_NAME_MAX_LENGTH = 8;
const GROUP_NAME_MIN_LENGTH = 1;

const settingsMinValues: { [key: string]: number } = {
  outputWidth: 100,
  scale: 1,
  spotsFilter: 1,
};
const settingsMaxValues: { [key: string]: number } = {
  outputWidth: 1000,
  scale: 5,
  spotsFilter: 400,
};

export const settingsLimits = {
  min: settingsMinValues,
  max: settingsMaxValues,
};

export const isValidCreateMapRequest = function (payload: CreateMapRequestPayload): CreateMapRequestValidationCode {
  if (typeof payload.title !== "string" || payload.title.length === 0 || payload.title.length > 20)
    return CreateMapRequestValidationCode.InvalidTitle;
  if (typeof payload.description !== "string" || payload.description.length > 200) return CreateMapRequestValidationCode.InvalidDescription;
  if (typeof payload.collection !== "number" || !(payload.collection >= 0)) return CreateMapRequestValidationCode.InvalidCollection;
  if (!isValidSettings(payload.settings)) return CreateMapRequestValidationCode.InvalidSettings;
  return CreateMapRequestValidationCode.Ok;
};

export const isValidWorldCreatePayload = function (payload: CreateWorldRequestPayload) {
  if (typeof payload !== "object") return false;
  if (typeof payload.server !== "string" || payload.server.length === 0) return false;
  if (typeof payload.num !== "string" || payload.num.length === 0) return false;
  if (typeof payload.domain !== "string" || payload.domain.length === 0) return false;
  if (typeof payload.timestamp !== "number" || payload.timestamp <= 0) return false;
  return true;
};

export const isValidID = function (id: number) {
  if (typeof id !== "number" || isNaN(id) || id < 1) return false;
  return true;
};

export const isValidCollectionTitle = function (title: string) {
  if (typeof title !== "string" || title.length === 0 || title.length > 15) return false;
  return true;
};

export const isValidCollectionDescription = function (description: string) {
  if (typeof description !== "string" || description.length > 500) return false;
  return true;
};

export const isValidLogin = function (login: string) {
  if (typeof login !== "string" || login.length < 2 || login.length > 15) return false;
  return true;
};

export const isValidPassword = function (password: string) {
  if (typeof password !== "string" || password.length < 8 || password.length > 16) return false;
  return true;
};

export const isValidUserRank = function (rank: number) {
  if (typeof rank !== "number" || !VALID_USER_RANKS.includes(rank)) return false;
  return true;
};

export const isValidTurn = function (input: number) {
  if (typeof input !== "number" || isNaN(input) || input < TURN_MIN || input > TURN_MAX) return false;
  return true;
};

export const isValidColor = function (input: string) {
  if (typeof input != "string") return false;
  const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
  return regex.test(input);
};

export const isValidGroupName = function (input: string) {
  if (typeof input !== "string" || input.length < GROUP_NAME_MIN_LENGTH || input.length > GROUP_NAME_MAX_LENGTH) return false;
  for (let i = 0; i < input.length; i++) {
    for (let char = 0; char < GROUP_NAME_FORBIDDEN_CHARACTERS.length; char++) {
      if (input[i] === GROUP_NAME_FORBIDDEN_CHARACTERS[char]) return false;
    }
  }
  return true;
};

export const isValidOutputWidth = function (input: number) {
  if (typeof input !== "number" || input < settingsLimits.min.outputWidth || input > settingsLimits.max.outputWidth) return false;
  return true;
};

export const isValidScale = function (input: number) {
  if (typeof input !== "number" || input < settingsLimits.min.scale || input > settingsLimits.max.scale) return false;
  return true;
};

export const isValidSpotsFilter = function (input: number) {
  if (typeof input !== "number" || input < settingsLimits.min.spotsFilter || input > settingsLimits.max.spotsFilter) return false;
  return true;
};

export const isValidSettings = function (settings: Settings) {
  if (typeof settings !== "object") return false;
  if (!isValidColor(settings.backgroundColor)) return false;
  if (typeof settings.displayUnmarked !== "boolean") return false;
  if (!isValidColor(settings.borderColor)) return false;
  if (!isValidOutputWidth(settings.outputWidth)) return false;
  if (!isValidScale(settings.scale)) return false;
  if (!isValidSpotsFilter(settings.spotsFilter)) return false;
  if (typeof settings.trim !== "boolean") return false;
  if (!isValidColor(settings.unmarkedColor)) return false;
  const groupNames: string[] = [];
  const tribes: string[] = [];
  for (const group of settings.markGroups) {
    if (!isValidGroupName(group.name)) return false;
    if (!isValidColor(group.color)) return false;
    groupNames.push(group.name);
    tribes.push(...group.tribes);
  }
  const uniqueGroupNames = new Set(groupNames);
  if (groupNames.length > uniqueGroupNames.size) return false;
  const uniqueTribes = new Set(tribes);
  if (tribes.length > uniqueTribes.size) return false;
  return true;
};
