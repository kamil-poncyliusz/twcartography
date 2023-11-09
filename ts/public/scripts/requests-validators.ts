import { isValidMapDescription, isValidSettings, isValidTitle } from "./validators.js";
import { CreateMapRequestPayload, CreateWorldRequestPayload, ReadCollectionsRequestPayload } from "../../src/types";

export enum CreateMapRequestValidationCode {
  Ok,
  InvalidSettings,
  InvalidTitle,
  InvalidDescription,
  InvalidCollection,
}

export const isValidCreateMapRequestPayload = function (payload: CreateMapRequestPayload): CreateMapRequestValidationCode {
  if (!isValidTitle(payload.title)) return CreateMapRequestValidationCode.InvalidTitle;
  if (!isValidMapDescription(payload.description)) return CreateMapRequestValidationCode.InvalidDescription;
  if (typeof payload.collection !== "number" || !(payload.collection >= 0)) return CreateMapRequestValidationCode.InvalidCollection;
  if (!isValidSettings(payload.settings)) return CreateMapRequestValidationCode.InvalidSettings;
  return CreateMapRequestValidationCode.Ok;
};

export const isValidCreateWorldRequestPayload = function (payload: CreateWorldRequestPayload): boolean {
  if (typeof payload !== "object") return false;
  if (typeof payload.server !== "string" || payload.server.length === 0) return false;
  if (typeof payload.num !== "string" || payload.num.length === 0) return false;
  if (typeof payload.domain !== "string" || payload.domain.length === 0) return false;
  if (typeof payload.startTimestamp !== "number" || payload.startTimestamp <= 0) return false;
  if (typeof payload.endTimestamp !== "number" || payload.endTimestamp < 0) return false;
  return true;
};

export const isValidReadCollectionsRequestPayload = function (payload: ReadCollectionsRequestPayload): boolean {
  if (typeof payload !== "object") return false;
  if (typeof payload.page !== "number" || isNaN(payload.page) || payload.page < 0) return false;
  if (typeof payload.authorId !== "number" || isNaN(payload.authorId) || payload.authorId < 0) return false;
  if (typeof payload.worldId !== "number" || isNaN(payload.worldId) || payload.worldId < 0) return false;
  return true;
};
