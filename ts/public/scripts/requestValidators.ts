import { CreateMapRequestPayload } from "../../src/Types";
import SettingsValidator from "./class/SettingsValidator.js";

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
