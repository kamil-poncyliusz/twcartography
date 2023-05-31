import { Settings } from "../../../Types";

const GROUP_NAME_MAX_LENGTH = 30,
  GROUP_NAME_MIN_LENGTH = 1,
  RADIUS_MAX = 500,
  RADIUS_MIN = 1,
  SCALE_MAX = 5,
  SCALE_MIN = 1,
  SPOTS_FILTER_MAX = 1000,
  SPOTS_FILTER_MIN = 1,
  SPOT_SIZE_MAX = 20,
  SPOT_SIZE_MIN = 1,
  TURN_MAX = 365,
  TURN_MIN = 0,
  VILLAGE_FILTER_MAX = 12154,
  VILLAGE_FILTER_MIN = 20;

const GROUP_NAME_FORBIDDEN_CHARACTERS = "#^,;";

class SettingsValidator {
  static color(input: string) {
    if (typeof input != "string") return false;
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    return regex.test(input);
  }
  static displayUnmarked(input: boolean) {
    return typeof input === "boolean";
  }
  static groupName(input: string) {
    if (typeof input !== "string" || input.length < GROUP_NAME_MIN_LENGTH || input.length > GROUP_NAME_MAX_LENGTH)
      return false;
    for (let i = 0; i < input.length; i++) {
      for (let char = 0; char < GROUP_NAME_FORBIDDEN_CHARACTERS.length; char++) {
        if (input[i] === GROUP_NAME_FORBIDDEN_CHARACTERS[char]) return false;
      }
    }
    return true;
  }
  static radius(input: number) {
    if (typeof input !== "number" || input < RADIUS_MIN || input > RADIUS_MAX) return false;
    return true;
  }
  static scale(input: number) {
    if (typeof input !== "number" || input < SCALE_MIN || input > SCALE_MAX) return false;
    return true;
  }
  static spotsFilter(input: number) {
    if (typeof input !== "number" || input < SPOTS_FILTER_MIN || input > SPOTS_FILTER_MAX) return false;
    return true;
  }
  static spotSize(input: number) {
    if (typeof input !== "number" || input < SPOT_SIZE_MIN || input > SPOT_SIZE_MAX) return false;
    return true;
  }
  static turn(input: number) {
    if (typeof input !== "number" || isNaN(input) || input < TURN_MIN || input > TURN_MAX) return false;
    return true;
  }
  static villageFilter(input: number) {
    if (typeof input !== "number" || input < VILLAGE_FILTER_MIN || input > VILLAGE_FILTER_MAX) return false;
    return true;
  }
  static settings(settings: Settings) {
    if (!SettingsValidator.color(settings.backgroundColor)) return false;
    if (!SettingsValidator.displayUnmarked(settings.displayUnmarked)) return false;
    if (!SettingsValidator.radius(settings.radius)) return false;
    if (!SettingsValidator.scale(settings.scale)) return false;
    if (!SettingsValidator.spotsFilter(settings.spotsFilter)) return false;
    if (!SettingsValidator.spotSize(settings.spotSize)) return false;
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
