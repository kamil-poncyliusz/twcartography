import { GROUP_NAME_FORBIDDEN_CHARACTERS, VALID_USER_RANKS } from "./constants.js";
import { CreateMapRequestPayload, CreateWorldRequestPayload, Settings } from "../../src/Types";

export enum CreateMapRequestValidationCode {
  Ok,
  InvalidSettings,
  InvalidTitle,
  InvalidDescription,
  InvalidCollection,
}

const LOGIN_MIN_LENGTH = 2;
const LOGIN_MAX_LENGTH = 15;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30;
const TURN_MAX = 365;
const TURN_MIN = 0;
const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 20;
const MAP_DESCRIPTION_MAX_LENGTH = 200;
const COLLECTION_DESCRIPTION_MAX_LENGTH = 500;
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
  spotsFilter: 500,
};

export const settingsLimits = {
  min: settingsMinValues,
  max: settingsMaxValues,
};

export const isValidCreateMapRequestPayload = function (payload: CreateMapRequestPayload): CreateMapRequestValidationCode {
  if (!isValidTitle(payload.title)) return CreateMapRequestValidationCode.InvalidTitle;
  if (!isValidMapDescription(payload.description)) return CreateMapRequestValidationCode.InvalidDescription;
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

export const isValidID = function (id: number): boolean {
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

export const isValidTurn = function (input: number): boolean {
  if (typeof input !== "number" || isNaN(input) || !Number.isInteger(input) || input < TURN_MIN || input > TURN_MAX) return false;
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

export const isValidSpotsFilter = function (input: number): boolean {
  if (typeof input !== "number" || !Number.isInteger(input) || input < settingsLimits.min.spotsFilter || input > settingsLimits.max.spotsFilter)
    return false;
  return true;
};

export const isValidSettings = function (settings: Settings): boolean {
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