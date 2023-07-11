import MapGenerator from "./MapGenerator.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe } from "../../../src/Types.js";
import { handleReadTurnData, handleReadWorld } from "../../../routes/api-handlers.js";
import { getRequest } from "../requests.js";
import { isValidColor, isValidGroupName, isValidOutputWidth, isValidScale, isValidSettings, isValidSpotsFilter, isValidTurn } from "../validators.js";

const DEFAULT_BACKGROUND_COLOR = "#202020";
const DEFAULT_BORDER_COLOR = "#808080";
const DEFAULT_DISPLAY_UNMARKED = false;
const DEFAULT_OUTPUT_WIDTH = 500;
const DEFAULT_SCALE = 2;
const DEFAULT_SPOTS_FILTER = 8;
const DEFAULT_TRIM = true;
const DEFAULT_UNMARKED_COLOR = "#808080";
const MAX_TRIBE_SUGGESTIONS = 20;

class GeneratorController {
  #backgroundColor: string = DEFAULT_BACKGROUND_COLOR;
  #borderColor: string = DEFAULT_BORDER_COLOR;
  data: { [key: number]: ParsedTurnData } = {};
  #displayUnmarked: boolean = DEFAULT_DISPLAY_UNMARKED;
  latestTurn: number = -1;
  markGroups: MarkGroup[] = [];
  #outputWidth: number = DEFAULT_OUTPUT_WIDTH;
  #spotsFilter: number = DEFAULT_SPOTS_FILTER;
  #scale: number = DEFAULT_SCALE;
  #server: string = "";
  #trim: boolean = DEFAULT_TRIM;
  turn: number = -1;
  #unmarkedColor: string = DEFAULT_UNMARKED_COLOR;
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
    if (!isValidGroupName(group.name) || !isValidColor(group.color)) return false;
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
    if (!isValidSettings(settings)) return false;
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
  changeMarkGroupColor(name: string, color: string): boolean {
    if (this.turn === -1) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    if (!isValidColor(color)) return false;
    const group = this.markGroups[groupIndex];
    group.color = color;
    return true;
  }
  changeMarkGroupName(oldName: string, newName: string): boolean {
    if (this.turn === -1) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === oldName);
    if (groupIndex === -1) return false;
    const group = this.markGroups[groupIndex];
    if (!isValidGroupName(newName)) return false;
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
  async changeWorld(world: number): Promise<boolean> {
    const endpoint = `/api/world/${world}`;
    const worldInfo: Awaited<ReturnType<typeof handleReadWorld>> = await getRequest(endpoint);
    this.data = {};
    this.turn = -1;
    if (!worldInfo) return false;
    this.#server = worldInfo.server + worldInfo.num;
    this.world = world;
    this.latestTurn = Math.floor((Date.now() - worldInfo.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    return true;
  }
  deleteMark(groupName: string, tribeTag: string): boolean {
    if (this.turn === -1) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribeIndex = group.tribes.findIndex((tribeID) => this.tribes[tribeID].tag === tribeTag);
    if (tribeIndex === -1) return false;
    group.tribes.splice(tribeIndex, 1);
    return true;
  }
  deleteMarkGroup(name: string): boolean {
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    this.markGroups.splice(groupIndex, 1);
    return true;
  }
  async fetchTurnData(turn: number): Promise<boolean> {
    if (this.world === 0) return false;
    if (!isValidTurn(turn)) return false;
    if (typeof this.data[turn] === "object") return true;
    const endpoint = `/api/turn-data/${this.world}/${turn}`;
    const turnData: Awaited<ReturnType<typeof handleReadTurnData>> = await getRequest(endpoint);
    if (!turnData) return false;
    this.data[turn] = turnData;
    return true;
  }
  findTribe(tag: string): Tribe | false {
    if (!this.tribes) return false;
    for (const tribeID in this.tribes) {
      if (this.tribes[tribeID].tag === tag) return this.tribes[tribeID];
    }
    return false;
  }
  getMapImageData(): ImageData | false {
    if (!isValidSettings(this.settings)) return false;
    if (typeof this.data[this.turn] !== "object") return false;
    const generator = new MapGenerator(this.data[this.turn], this.settings);
    if (!generator.imageData) return false;
    return generator.imageData;
  }
  getSuggestions(tag: string, limit = MAX_TRIBE_SUGGESTIONS): Tribe[] {
    const tribes = this.tribes;
    if (!tribes) return [];
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
  isGroupNameTaken(name: string): boolean {
    for (const group of this.markGroups) {
      if (group.name === name) return true;
    }
    return false;
  }
  setBackgroundColor(color: string): boolean {
    if (this.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.#backgroundColor = color;
    return true;
  }
  setBorderColor(color: string): boolean {
    if (this.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.#borderColor = color;
    return true;
  }
  setDisplayUnmarked(value: boolean): boolean {
    if (this.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.#displayUnmarked = value;
    return true;
  }
  setOutputWidth(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidOutputWidth(value)) return false;
    this.#outputWidth = value;
    return true;
  }
  setScale(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidScale(value)) return false;
    this.#scale = value;
    return true;
  }
  setSpotsFilter(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidSpotsFilter(value)) return false;
    this.#spotsFilter = value;
    return true;
  }
  setTrim(value: boolean): boolean {
    if (this.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.#trim = value;
    return true;
  }
  setUnmarkedColor(color: string): boolean {
    if (this.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.#unmarkedColor = color;
    return true;
  }
}

export default GeneratorController;
