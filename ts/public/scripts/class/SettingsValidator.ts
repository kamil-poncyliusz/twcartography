import { Settings } from "../../../src/Types";

const GROUP_NAME_MAX_LENGTH = 30,
  GROUP_NAME_MIN_LENGTH = 1,
  TURN_MAX = 365,
  TURN_MIN = 0;

const min: { [key: string]: number } = {
  outputWidth: 100,
  scale: 1,
  spotsFilter: 1,
  spotSize: 2,
  villageFilter: 20,
};
const max: { [key: string]: number } = {
  outputWidth: 1000,
  scale: 5,
  spotsFilter: 400,
  spotSize: 20,
  villageFilter: 12154,
};

const GROUP_NAME_FORBIDDEN_CHARACTERS = "#^,;";

class SettingsValidator {
  static boolean(input: boolean) {
    return typeof input === "boolean";
  }
  static color(input: string) {
    if (typeof input != "string") return false;
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    return regex.test(input);
  }
  static groupName(input: string) {
    if (typeof input !== "string" || input.length < GROUP_NAME_MIN_LENGTH || input.length > GROUP_NAME_MAX_LENGTH) return false;
    for (let i = 0; i < input.length; i++) {
      for (let char = 0; char < GROUP_NAME_FORBIDDEN_CHARACTERS.length; char++) {
        if (input[i] === GROUP_NAME_FORBIDDEN_CHARACTERS[char]) return false;
      }
    }
    return true;
  }
  static outputWidth(input: number) {
    if (typeof input !== "number" || input < min.outputWidth || input > max.outputWidth) return false;
    return true;
  }
  static scale(input: number) {
    if (typeof input !== "number" || input < min.scale || input > max.scale) return false;
    return true;
  }
  static spotsFilter(input: number) {
    if (typeof input !== "number" || input < min.spotsFilter || input > max.spotsFilter) return false;
    return true;
  }
  static spotSize(input: number) {
    if (typeof input !== "number" || input < min.spotSize || input > max.spotSize) return false;
    return true;
  }
  static turn(input: number) {
    if (typeof input !== "number" || isNaN(input) || input < TURN_MIN || input > TURN_MAX) return false;
    return true;
  }
  static villageFilter(input: number) {
    if (typeof input !== "number" || input < min.villageFilter || input > max.villageFilter) return false;
    return true;
  }
  static settings(settings: Settings) {
    if (!SettingsValidator.color(settings.backgroundColor)) return false;
    if (!SettingsValidator.boolean(settings.displayUnmarked)) return false;
    if (!SettingsValidator.outputWidth(settings.outputWidth)) return false;
    if (!SettingsValidator.scale(settings.scale)) return false;
    if (!SettingsValidator.spotsFilter(settings.spotsFilter)) return false;
    if (!SettingsValidator.spotSize(settings.spotSize)) return false;
    if (!SettingsValidator.boolean(settings.trim)) return false;
    if (!SettingsValidator.color(settings.unmarkedColor)) return false;
    if (!SettingsValidator.villageFilter(settings.villageFilter)) return false;
    const groupNames: string[] = [];
    const tribes: string[] = [];
    for (const group of settings.markGroups) {
      if (!SettingsValidator.groupName(group.name)) return false;
      if (!SettingsValidator.color(group.color)) return false;
      groupNames.push(group.name);
      tribes.push(...group.tribes);
    }
    const uniqueGroupNames = new Set(groupNames);
    if (groupNames.length > uniqueGroupNames.size) return false;
    const uniqueTribes = new Set(tribes);
    if (tribes.length > uniqueTribes.size) return false;
    return true;
  }
}

export default SettingsValidator;

export const limits = {
  min: min,
  max: max,
};
