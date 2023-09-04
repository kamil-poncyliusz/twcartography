import MapGenerator from "./MapGenerator.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe, Caption } from "../../../src/Types.js";
import { handleReadTurnData, handleReadWorld } from "../../../routes/api-handlers.js";
import { getRequest } from "../requests.js";
import {
  isValidCaption,
  isValidCaptionCoordinate,
  isValidCaptionFontSize,
  isValidCaptionText,
  isValidColor,
  isValidGroupName,
  isValidId,
  isValidOutputWidth,
  isValidScale,
  isValidSettings,
  isValidTopSpotSize,
  isValidTurn,
} from "../validators.js";
import MarkGroupsTab from "./MarkGroupsTab.js";
import SuggestionsTab from "./SuggestionsTab.js";
import SettingsTab from "./SettingsTab.js";
import CanvasFrame from "./CanvasFrame.js";
import CaptionsTab from "./CaptionsTab.js";

const DEFAULT_AUTO_REFRESH = true;
const DEFAULT_BACKGROUND_COLOR = "#202020";
const DEFAULT_BORDER_COLOR = "#808080";
const DEFAULT_OUTPUT_WIDTH = 500;
const DEFAULT_SCALE = 2;
const DEFAULT_TOP_SPOT_SIZE = 8;
const DEFAULT_TRIM = true;
const MAX_TRIBE_SUGGESTIONS = 20;

class GeneratorController {
  autoRefresh: boolean = DEFAULT_AUTO_REFRESH;
  #backgroundColor: string = DEFAULT_BACKGROUND_COLOR;
  #borderColor: string = DEFAULT_BORDER_COLOR;
  #canvasFrame: CanvasFrame;
  captions: Caption[] = [];
  #captionsTab: CaptionsTab;
  data: { [key: number]: ParsedTurnData } = {};
  latestTurn: number = -1;
  markGroups: MarkGroup[] = [];
  #markGroupsTab: MarkGroupsTab;
  #outputWidth: number = DEFAULT_OUTPUT_WIDTH;
  #scale: number = DEFAULT_SCALE;
  #server: string = "";
  #settingsTab: SettingsTab;
  #suggestionsTab: SuggestionsTab;
  #topSpotSize: number = DEFAULT_TOP_SPOT_SIZE;
  #trim: boolean = DEFAULT_TRIM;
  turn: number = -1;
  world: number = 0;
  constructor() {
    this.#canvasFrame = new CanvasFrame(this);
    this.#captionsTab = new CaptionsTab(this);
    this.#markGroupsTab = new MarkGroupsTab(this);
    this.#suggestionsTab = new SuggestionsTab(this);
    this.#settingsTab = new SettingsTab(this);
  }
  get settings(): Settings {
    return {
      backgroundColor: this.#backgroundColor,
      borderColor: this.#borderColor,
      captions: this.captions,
      markGroups: this.markGroups,
      outputWidth: this.#outputWidth,
      scale: this.#scale,
      topSpotSize: this.#topSpotSize,
      trim: this.#trim,
      turn: this.turn,
      world: this.world,
    };
  }
  get tribes(): { [key: string]: Tribe } {
    if (this.world === 0 || this.turn === -1) return {};
    return this.data[this.turn].tribes;
  }
  addCaption(caption: Caption, options?: { skipUpdate?: boolean }): boolean {
    if (!isValidCaption(caption)) return false;
    this.captions.push(caption);
    if (options?.skipUpdate) return true;
    this.#canvasFrame.render();
    this.#captionsTab.render();
    this.#settingsTab.update();
    return true;
  }
  addMark(markGroupIndex: number, tribeTag: string, options?: { skipUpdate?: boolean }): boolean {
    if (this.turn === -1) return false;
    const markGroup = this.markGroups[markGroupIndex];
    const tribe = this.findTribe(tribeTag);
    if (!tribe || !markGroup) return false;
    markGroup.tribes.push(tribe.id);
    this.sortMarkGroups();
    if (options?.skipUpdate) return true;
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  addMarkGroup(group: MarkGroup, options?: { skipUpdate?: boolean }): boolean {
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
  async applySettings(settings: Settings): Promise<boolean> {
    if (!isValidSettings(settings)) return false;
    const isWorldChanged = await this.changeWorld(settings.world);
    if (!isWorldChanged) return false;
    this.#backgroundColor = settings.backgroundColor;
    this.#outputWidth = settings.outputWidth;
    this.#scale = settings.scale;
    this.#topSpotSize = settings.topSpotSize;
    this.#trim = settings.trim;
    const isTurnChanged = await this.changeTurn(settings.turn);
    if (!isTurnChanged) return false;
    this.markGroups = [];
    for (const group of settings.markGroups) {
      this.addMarkGroup(
        {
          tribes: [],
          name: group.name,
          color: group.color,
        },
        { skipUpdate: true }
      );
      for (let tribeId of group.tribes) {
        const tribe = this.tribes[tribeId];
        if (tribe) this.addMark(this.markGroups.length - 1, tribe.tag, { skipUpdate: true });
      }
    }
    for (const caption of settings.captions) {
      this.addCaption(caption, { skipUpdate: true });
    }
    this.#canvasFrame.render();
    this.#captionsTab.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  changeCaptionColor(captionIndex: number, newColor: string): boolean {
    const caption = this.captions[captionIndex];
    if (!caption) return false;
    if (!isValidColor(newColor)) return false;
    caption.color = newColor;
    this.#canvasFrame.render();
    return true;
  }
  changeCaptionFontSize(captionIndex: number, newFontSize: number): boolean {
    const caption = this.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionFontSize(newFontSize)) return false;
    caption.fontSize = newFontSize;
    this.#canvasFrame.render();
    return true;
  }
  changeCaptionText(captionIndex: number, newText: string): boolean {
    const caption = this.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionText(newText)) return false;
    caption.text = newText;
    this.#canvasFrame.render();
    return true;
  }
  changeCaptionX(captionIndex: number, newX: number): boolean {
    const caption = this.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionCoordinate(newX)) return false;
    caption.x = newX;
    this.#canvasFrame.render();
    return true;
  }
  changeCaptionY(captionIndex: number, newY: number): boolean {
    const caption = this.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionCoordinate(newY)) return false;
    caption.y = newY;
    this.#canvasFrame.render();
    return true;
  }
  changeMarkGroupColor(markGroupIndex: number, newColor: string): boolean {
    if (this.turn === -1) return false;
    const markGroup = this.markGroups[markGroupIndex];
    if (!markGroup) return false;
    if (!isValidColor(newColor)) return false;
    markGroup.color = newColor;
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    return true;
  }
  changeMarkGroupName(markGroupIndex: number, newName: string): boolean {
    if (this.turn === -1) return false;
    const markGroup = this.markGroups[markGroupIndex];
    if (!markGroup) return false;
    if (!isValidGroupName(newName)) return false;
    if (this.isGroupNameTaken(newName)) return false;
    markGroup.name = newName;
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
        const tribeId = group.tribes[tribeIndex];
        if (!this.tribes[tribeId]) {
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
    if (!isValidId(world)) return false;
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
  deleteCaption(captionIndex: number): boolean {
    if (!this.captions[captionIndex]) return false;
    this.captions.splice(captionIndex, 1);
    this.#captionsTab.render();
    this.#canvasFrame.render();
    return true;
  }
  deleteMark(markGroupIndex: number, tribeTag: string): boolean {
    if (this.turn === -1) return false;
    const markGroup = this.markGroups[markGroupIndex];
    if (!markGroup) return false;
    const tribeIndex = markGroup.tribes.findIndex((tribeId) => this.tribes[tribeId].tag === tribeTag);
    if (tribeIndex === -1) return false;
    markGroup.tribes.splice(tribeIndex, 1);
    this.sortMarkGroups();
    this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  deleteMarkGroup(markGroupIndex: number): boolean {
    if (!this.markGroups[markGroupIndex]) return false;
    this.markGroups.splice(markGroupIndex, 1);
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
  findTribe(tag: string): Tribe | null {
    if (!this.tribes) return null;
    for (const tribeId in this.tribes) {
      if (this.tribes[tribeId].tag === tag) return this.tribes[tribeId];
    }
    return null;
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
    for (const tribeId in tribes) {
      if (tribes[tribeId].tag.includes(tag) || tag === "") suggestions.push(tribes[tribeId]);
    }
    for (const group of this.markGroups) {
      for (const tribeId of group.tribes) {
        for (let i = 0; i < suggestions.length; i++) {
          if (tribeId === suggestions[i].id) suggestions.splice(i, 1);
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
  setTopSpotSize(value: number): boolean {
    if (this.turn === -1) return false;
    if (!isValidTopSpotSize(value)) return false;
    this.#topSpotSize = value;
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
  sortMarkGroups() {
    const sums: { [key: string]: number } = {};
    for (let group of this.markGroups) {
      sums[group.name] = group.tribes.reduce((sum, tribeId) => sum + this.tribes[tribeId].points, 0);
    }
    this.markGroups.sort((a, b) => sums[b.name] - sums[a.name]);
  }
}

export default GeneratorController;
