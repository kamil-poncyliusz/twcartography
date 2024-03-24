import { isValidDomain, isValidMapDescription, isValidSettings, isValidTitle } from "./validators.js";
import { CreateMapRequestPayload, CreateServerRequestPayload, ReadCollectionsRequestFilters } from "../../src/types";

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
  if (typeof payload.collectionId !== "number" || !(payload.collectionId >= 0)) return CreateMapRequestValidationCode.InvalidCollection;
  if (!isValidSettings(payload.settings)) return CreateMapRequestValidationCode.InvalidSettings;
  return CreateMapRequestValidationCode.Ok;
};

export const isValidCreateServerRequestPayload = function (payload: CreateServerRequestPayload): boolean {
  if (!isValidDomain) return false;
  if (typeof payload.name !== "string" || payload.name.length !== 2) return false;
  if (payload.domain !== null && !isValidDomain(payload.domain)) return false;
  if (typeof payload.updateHour !== "number") return false;
  return true;
};

export const isValidReadCollectionsRequestFilters = function (payload: ReadCollectionsRequestFilters): boolean {
  if (typeof payload !== "object") return false;
  if (typeof payload.page !== "number" || isNaN(payload.page) || payload.page < 0) return false;
  if (typeof payload.authorId !== "number" || isNaN(payload.authorId) || payload.authorId < 0) return false;
  if (typeof payload.worldId !== "number" || isNaN(payload.worldId) || payload.worldId < 0) return false;
  return true;
};
