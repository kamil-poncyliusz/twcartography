import { Settings } from "../../../src/Types";
import { GROUP_NAME_FORBIDDEN_CHARACTERS, GROUP_NAME_MAX_LENGTH, GROUP_NAME_MIN_LENGTH, SETTINGS_LIMITS as LIMITS } from "../constants.js";

const TURN_MAX = 365,
  TURN_MIN = 0;

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
    if (typeof input !== "number" || input < LIMITS.MIN.outputWidth || input > LIMITS.MAX.outputWidth) return false;
    return true;
  }
  static scale(input: number) {
    if (typeof input !== "number" || input < LIMITS.MIN.scale || input > LIMITS.MAX.scale) return false;
    return true;
  }
  static spotsFilter(input: number) {
    if (typeof input !== "number" || input < LIMITS.MIN.spotsFilter || input > LIMITS.MAX.spotsFilter) return false;
    return true;
  }
  static turn(input: number) {
    if (typeof input !== "number" || isNaN(input) || input < TURN_MIN || input > TURN_MAX) return false;
    return true;
  }
  static settings(settings: Settings) {
    if (typeof settings !== "object") return false;
    if (!SettingsValidator.color(settings.backgroundColor)) return false;
    if (!SettingsValidator.boolean(settings.displayUnmarked)) return false;
    if (!SettingsValidator.color(settings.borderColor)) return false;
    if (!SettingsValidator.outputWidth(settings.outputWidth)) return false;
    if (!SettingsValidator.scale(settings.scale)) return false;
    if (!SettingsValidator.spotsFilter(settings.spotsFilter)) return false;
    if (!SettingsValidator.boolean(settings.trim)) return false;
    if (!SettingsValidator.color(settings.unmarkedColor)) return false;
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
