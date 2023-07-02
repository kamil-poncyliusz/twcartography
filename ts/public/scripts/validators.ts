import { CreateMapRequestPayload } from "../../src/Types";
import SettingsValidator from "./class/SettingsValidator.js";
import { VALID_USER_RANKS } from "./constants.js";

export enum CreateMapRequestValidationCode {
  Ok,
  InvalidSettings,
  InvalidTitle,
  InvalidDescription,
  InvalidCollection,
}

export const validateCreateMapRequest = function (payload: CreateMapRequestPayload): CreateMapRequestValidationCode {
  if (typeof payload.title !== "string" || payload.title.length === 0 || payload.title.length > 20)
    return CreateMapRequestValidationCode.InvalidTitle;
  if (typeof payload.description !== "string" || payload.description.length > 200) return CreateMapRequestValidationCode.InvalidDescription;
  if (typeof payload.collection !== "number" || !(payload.collection >= 0)) return CreateMapRequestValidationCode.InvalidCollection;
  if (!SettingsValidator.settings(payload.settings)) return CreateMapRequestValidationCode.InvalidSettings;
  return CreateMapRequestValidationCode.Ok;
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

export const isValidTurn = function (turn: number) {
  if (typeof turn !== "number" || isNaN(turn) || turn < 0 || turn > 365) return false;
  return true;
};
