import MapGenerator from "./MapGenerator.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe } from "../../../src/Types.js";
import { handleReadTurnData, handleReadWorld } from "../../../routes/api-handlers.js";
import { getRequest } from "../requests.js";
import {
  isValidColor,
  isValidGroupName,
  isValidID,
  isValidOutputWidth,
  isValidScale,
  isValidSettings,
  isValidSpotsFilter,
  isValidTurn,
} from "../validators.js";
import MarkGroupsTab from "./MarkGroupsTab.js";
import SuggestionsTab from "./SuggestionsTab.js";
import SettingsTab from "./SettingsTab.js";
import CanvasFrame from "./CanvasFrame.js";

const DEFAULT_AUTO_REFRESH = true;
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
  autoRefresh: boolean = DEFAULT_AUTO_REFRESH;
  #backgroundColor: string = DEFAULT_BACKGROUND_COLOR;
  #borderColor: string = DEFAULT_BORDER_COLOR;
  #canvasFrame: CanvasFrame;
  data: { [key: number]: ParsedTurnData } = {};
  #displayUnmarked: boolean = DEFAULT_DISPLAY_UNMARKED;
  latestTurn: number = -1;
  markGroups: MarkGroup[] = [];
  #markGroupsTab: MarkGroupsTab;
  #outputWidth: number = DEFAULT_OUTPUT_WIDTH;
  #spotsFilter: number = DEFAULT_SPOTS_FILTER;
  #scale: number = DEFAULT_SCALE;
  #server: string = "";
  #settingsTab: SettingsTab;
  #suggestionsTab: SuggestionsTab;
  #trim: boolean = DEFAULT_TRIM;
  turn: number = -1;
  #unmarkedColor: string = DEFAULT_UNMARKED_COLOR;
  world: number = 0;
  constructor() {
    this.#canvasFrame = new CanvasFrame(this);
    this.#markGroupsTab = new MarkGroupsTab(this);
    this.#suggestionsTab = new SuggestionsTab(this);
    this.#settingsTab = new SettingsTab(this);
  }
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
  addMark(tribeTag: string, groupName: string, options?: { skipUpdate?: boolean }) {
    if (this.turn === -1) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    const tribe = this.findTribe(tribeTag);
    if (!tribe || !group) return false;
    group.tribes.push(tribe.id);
    this.sortMarkGroups();
    if (options?.skipUpdate) return true;
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  addMarkGroup(group: MarkGroup, options?: { skipUpdate?: boolean }) {
    if (this.turn === -1) return false;
    if (!isValidGroupName(group.name) || !isValidColor(group.color)) return false;
    if (this.isGroupNameTaken(group.name)) return false;
    const newGroup: MarkGroup = {
      tribes: [],
      name: group.name,
      color: group.color,
    };
    this.markGroups.push(newGroup);
    if (options?.skipUpdate) return true;
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    return true;
  }
  async applySettings(settings: Settings) {
    if (!isValidSettings(settings)) return false;
    const isWorldChanged = await this.changeWorld(settings.world);
    if (!isWorldChanged) return false;
    this.#backgroundColor = settings.backgroundColor;
    this.#displayUnmarked = settings.displayUnmarked;
    this.#outputWidth = settings.outputWidth;
    this.#scale = settings.scale;
    this.#spotsFilter = settings.spotsFilter;
    this.#trim = settings.trim;
    this.#unmarkedColor = settings.unmarkedColor;
    const isTurnChanged = await this.changeTurn(settings.turn);
    if (!isTurnChanged) return false;
    this.markGroups = [];
    for (let group of settings.markGroups) {
      this.addMarkGroup(
        {
          tribes: [],
          name: group.name,
          color: group.color,
        },
        { skipUpdate: true }
      );
      for (let tribeID of group.tribes) {
        const tribe = this.tribes[tribeID];
        if (tribe) this.addMark(tribe.tag, group.name, { skipUpdate: true });
      }
    }
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  changeMarkGroupColor(name: string, color: string): boolean {
    if (this.turn === -1) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    if (!isValidColor(color)) return false;
    const group = this.markGroups[groupIndex];
    group.color = color;
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
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
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#suggestionsTab.render();
    return true;
  }
  async changeTurn(turn: number, options?: { skipUpdate?: boolean }): Promise<boolean> {
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
    if (options?.skipUpdate) return true;
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  async changeWorld(world: number): Promise<boolean> {
    if (!isValidID(world)) return false;
    if (world === this.world) return true;
    const endpoint = `/api/world/${world}`;
    const worldInfo: Awaited<ReturnType<typeof handleReadWorld>> = await getRequest(endpoint);
    this.data = {};
    this.turn = -1;
    if (!worldInfo) return false;
    this.#server = worldInfo.server + worldInfo.num;
    this.world = world;
    this.latestTurn = Math.floor((Date.now() - worldInfo.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    this.#settingsTab.update();
    return true;
  }
  deleteMark(groupName: string, tribeTag: string): boolean {
    if (this.turn === -1) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribeIndex = group.tribes.findIndex((tribeID) => this.tribes[tribeID].tag === tribeTag);
    if (tribeIndex === -1) return false;
    group.tribes.splice(tribeIndex, 1);
    this.sortMarkGroups();
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  deleteMarkGroup(name: string): boolean {
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    this.markGroups.splice(groupIndex, 1);
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
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
  forceRenderCanvas = () => {
    this.#canvasFrame.render({ force: true });
  };
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
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setBorderColor(color: string): boolean {
    if (this.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.#borderColor = color;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setDisplayUnmarked(value: boolean): boolean {
    if (this.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.#displayUnmarked = value;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setOutputWidth(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidOutputWidth(value)) return false;
    this.#outputWidth = value;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setScale(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidScale(value)) return false;
    this.#scale = value;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setSpotsFilter(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidSpotsFilter(value)) return false;
    this.#spotsFilter = value;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setTrim(value: boolean): boolean {
    if (this.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.#trim = value;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setUnmarkedColor(color: string): boolean {
    if (this.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.#unmarkedColor = color;
    this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  sortMarkGroups() {
    const sums: { [key: string]: number } = {};
    for (let group of this.markGroups) {
      sums[group.name] = group.tribes.reduce((sum, tribeID) => sum + this.tribes[tribeID].points, 0);
    }
    this.markGroups.sort((a, b) => sums[b.name] - sums[a.name]);
  }
}

export default GeneratorController;
