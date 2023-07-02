import MapGenerator from "./MapGenerator.js";
import SettingsValidator from "./SettingsValidator.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe } from "../../../src/Types.js";
import { handleReadTurnData, handleReadWorld } from "../../../routes/api-handlers.js";
import { GENERATOR_CONTROLLER_DEFAULTS as DEFAULTS, MAX_TRIBE_SUGGESTIONS } from "../constants.js";

class GeneratorController {
  #backgroundColor: string = DEFAULTS.BACKGROUND_COLOR;
  #borderColor: string = DEFAULTS.BORDER_COLOR;
  data: { [key: number]: ParsedTurnData } = {};
  #displayUnmarked: boolean = DEFAULTS.DISPLAY_UNMARKED;
  latestTurn: number = -1;
  markGroups: MarkGroup[] = [];
  #outputWidth: number = DEFAULTS.OUTPUT_WIDTH;
  #spotsFilter: number = DEFAULTS.SPOTS_FILTER;
  #scale: number = DEFAULTS.SCALE;
  #server: string = "";
  #trim: boolean = DEFAULTS.TRIM;
  turn: number = -1;
  #unmarkedColor: string = DEFAULTS.UNMARKED_COLOR;
  world: number = 0;
  constructor() {}
  get settings(): Settings {
    return {
      backgroundColor: this.#backgroundColor,
      borderColor: this.#borderColor,
      displayUnmarked: this.#displayUnmarked,
      markGroups: this.markGroups,
      outputWidth: this.#outputWidth,
      scale: this.#scale,
      spotsFilter: this.#spotsFilter,
      trim: this.#trim,
      turn: this.turn,
      unmarkedColor: this.#unmarkedColor,
      world: this.world,
    };
  }
  get tribes(): { [key: string]: Tribe } {
    if (this.world === 0 || this.turn === -1) return {};
    return this.data[this.turn].tribes;
  }
  addMark(tribeTag: string, groupName: string) {
    if (this.turn === -1) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (!group) return false;
    const tribe = this.findTribe(tribeTag);
    if (!tribe) return false;
    group.tribes.push(tribe.id);
    return true;
  }
  addMarkGroup(group: MarkGroup) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.groupName(group.name) || !SettingsValidator.color(group.color)) return false;
    if (this.isGroupNameTaken(group.name)) return false;
    const newGroup: MarkGroup = {
      tribes: [],
      name: group.name,
      color: group.color,
    };
    this.markGroups.push(newGroup);
    return true;
  }
  async applySettings(settings: Settings) {
    if (!SettingsValidator.settings(settings)) return false;
    if (settings.world !== this.world) {
      const isWorldChanged = await this.changeWorld(settings.world);
      if (!isWorldChanged) return false;
      const isTurnChanged = await this.changeTurn(settings.turn);
      if (!isTurnChanged) return false;
    }
    this.setBackgroundColor(settings.backgroundColor);
    this.setDisplayUnmarked(settings.displayUnmarked);
    this.setOutputWidth(settings.outputWidth);
    this.setScale(settings.scale);
    this.setSpotsFilter(settings.spotsFilter);
    this.setTrim(settings.trim);
    this.setUnmarkedColor(settings.unmarkedColor);
    this.markGroups = [];
    for (let group of settings.markGroups) {
      this.addMarkGroup({
        tribes: [],
        name: group.name,
        color: group.color,
      });
      for (let tribeID of group.tribes) {
        const tribe = this.tribes[tribeID];
        if (tribe) this.addMark(tribe.tag, group.name);
      }
    }
    return true;
  }
  changeMarkGroupColor(name: string, color: string) {
    if (this.turn === -1) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    const group = this.markGroups[groupIndex];
    group.color = color;
    return true;
  }
  changeMarkGroupName(oldName: string, newName: string) {
    if (this.turn === -1) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === oldName);
    if (groupIndex === -1) return false;
    const group = this.markGroups[groupIndex];
    if (!SettingsValidator.groupName(newName)) return false;
    if (this.isGroupNameTaken(newName)) return false;
    group.name = newName;
    return true;
  }
  async changeTurn(turn: number): Promise<boolean> {
    const isTurnDataAvailable = await this.fetchTurnData(turn);
    if (!isTurnDataAvailable) {
      this.turn = -1;
      return false;
    }
    this.turn = turn;
    for (let group of this.markGroups) {
      for (let tribeIndex = group.tribes.length - 1; tribeIndex >= 0; tribeIndex--) {
        const tribeID = group.tribes[tribeIndex];
        if (!this.tribes[tribeID]) {
          group.tribes.splice(tribeIndex, 1);
        }
      }
    }
    return true;
  }
  async changeWorld(world: number) {
    const url = `${window.location.origin}/api/world/${world}`;
    const response = await fetch(url);
    const worldInfo: Awaited<ReturnType<typeof handleReadWorld>> = await response.json();
    this.data = {};
    this.turn = -1;
    if (!worldInfo) return false;
    this.#server = worldInfo.server + worldInfo.num;
    this.world = world;
    this.latestTurn = Math.floor((Date.now() - worldInfo.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    return true;
  }
  deleteMark(groupName: string, tribeTag: string) {
    if (this.turn === -1) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribeIndex = group.tribes.findIndex((tribeID) => this.tribes[tribeID].tag === tribeTag);
    if (tribeIndex === -1) return false;
    group.tribes.splice(tribeIndex, 1);
    return true;
  }
  deleteMarkGroup(name: string) {
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    this.markGroups.splice(groupIndex, 1);
    return true;
  }
  async fetchTurnData(turn: number) {
    if (this.world === 0) return false;
    if (!SettingsValidator.turn(turn)) return false;
    if (typeof this.data[turn] === "object") return true;
    const url = `${window.location.origin}/api/turn-data/${this.world}/${turn}`;
    const response = await fetch(url);
    const turnData: Awaited<ReturnType<typeof handleReadTurnData>> = await response.json();
    if (!turnData) return false;
    this.data[turn] = turnData;
    return true;
  }
  findTribe(tag: string) {
    if (!this.tribes) return false;
    for (const tribeID in this.tribes) {
      if (this.tribes[tribeID].tag === tag) return this.tribes[tribeID];
    }
    return false;
  }
  getMapImageData() {
    if (!SettingsValidator.settings(this.settings)) return false;
    if (typeof this.data[this.turn] !== "object") return false;
    const generator = new MapGenerator(this.data[this.turn], this.settings);
    if (!generator.imageData) return false;
    return generator.imageData;
  }
  getSuggestions(tag: string, limit = MAX_TRIBE_SUGGESTIONS) {
    const tribes = this.tribes;
    if (!tribes) return false;
    const suggestions: Tribe[] = [];
    for (const tribeID in tribes) {
      if (tribes[tribeID].tag.includes(tag) || tag === "") suggestions.push(tribes[tribeID]);
    }
    for (const group of this.markGroups) {
      for (const tribeID of group.tribes) {
        for (let i = 0; i < suggestions.length; i++) {
          if (tribeID === suggestions[i].id) suggestions.splice(i, 1);
        }
      }
    }
    suggestions.sort((a, b) => {
      if (a.points < b.points) return 1;
      if (a.points > b.points) return -1;
      return 0;
    });
    suggestions.splice(limit);
    return suggestions;
  }
  isGroupNameTaken(name: string) {
    for (const group of this.markGroups) {
      if (group.name === name) return true;
    }
    return false;
  }
  setBackgroundColor(color: string) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    this.#backgroundColor = color;
    return true;
  }
  setBorderColor(color: string) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    this.#borderColor = color;
    return true;
  }
  setDisplayUnmarked(value: boolean) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.boolean(value)) return false;
    this.#displayUnmarked = value;
    return true;
  }
  setOutputWidth(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.outputWidth(value)) return false;
    this.#outputWidth = value;
    return true;
  }
  setScale(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.scale(value)) return false;
    this.#scale = value;
    return true;
  }
  setSpotsFilter(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.spotsFilter(value)) return false;
    this.#spotsFilter = value;
    return true;
  }
  setTrim(value: boolean) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.boolean(value)) return false;
    this.#trim = value;
    return true;
  }
  setUnmarkedColor(color: string) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    this.#unmarkedColor = color;
    return true;
  }
}

export default GeneratorController;
