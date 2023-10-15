import { handleReadTurnData } from "../../../routes/api/turn-data-handlers.js";
import { handleReadWorld } from "../../../routes/api/world-handlers.js";
import { getRequest } from "../requests.js";
import {
  isValidCaption,
  isValidCaptionCoordinate,
  isValidCaptionFontSize,
  isValidCaptionText,
  isValidColor,
  isValidGroupName,
  isValidId,
  isValidLegendFontSize,
  isValidOutputWidth,
  isValidScale,
  isValidSettings,
  isValidTopSpotSize,
  isValidTurn,
} from "../validators.js";
import MapGenerator from "./map-generator.js";
import MarkGroupsTab from "./mark-groups-tab.js";
import SuggestionsTab from "./suggestions-tab.js";
import SettingsTab from "./settings-tab.js";
import CanvasFrame from "./canvas-frame.js";
import CaptionsTab from "./captions-tab.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe, Caption } from "../../../src/types.js";

export const defaultSettings: Settings = {
  backgroundColor: "#202020",
  borderColor: "#808080",
  captions: [],
  drawBorders: true,
  drawLegend: true,
  legendFontSize: 5,
  markGroups: [],
  outputWidth: 500,
  scale: 2,
  smoothBorders: true,
  topSpotSize: 8,
  trim: true,
  turn: 0,
  world: 1,
};

const DEFAULT_AUTO_REFRESH = true;
const MAX_TRIBE_SUGGESTIONS = 50;

class GeneratorController {
  autoRefresh: boolean = DEFAULT_AUTO_REFRESH;
  #backgroundColor: string = defaultSettings.backgroundColor;
  #canvasFrame: CanvasFrame;
  #captionsTab: CaptionsTab;
  data: { [key: number]: ParsedTurnData } = {};
  latestTurn: number = -1;
  #mapGenerator: MapGenerator | undefined = undefined;
  #markGroupsTab: MarkGroupsTab;
  settings: Settings = {
    backgroundColor: defaultSettings.backgroundColor,
    borderColor: defaultSettings.borderColor,
    captions: [],
    drawBorders: defaultSettings.drawBorders,
    drawLegend: defaultSettings.drawLegend,
    legendFontSize: defaultSettings.legendFontSize,
    markGroups: [],
    outputWidth: defaultSettings.outputWidth,
    scale: defaultSettings.scale,
    smoothBorders: defaultSettings.smoothBorders,
    trim: defaultSettings.trim,
    topSpotSize: defaultSettings.topSpotSize,
    turn: defaultSettings.turn,
    world: defaultSettings.world,
  };
  #settingsTab: SettingsTab;
  #suggestionsTab: SuggestionsTab;
  constructor() {
    this.#canvasFrame = new CanvasFrame(this);
    this.#captionsTab = new CaptionsTab(this);
    this.#markGroupsTab = new MarkGroupsTab(this);
    this.#suggestionsTab = new SuggestionsTab(this);
    this.#settingsTab = new SettingsTab(this);
  }
  get tribes(): { [key: string]: Tribe } {
    if (this.settings.world === 0 || this.settings.turn === -1) return {};
    return this.data[this.settings.turn].tribes;
  }
  addCaption(caption: Caption, options?: { skipUpdate?: boolean }): boolean {
    if (!isValidCaption(caption)) return false;
    this.settings.captions.push(caption);
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (options?.skipUpdate) return true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#captionsTab.render();
    this.#settingsTab.update();
    return true;
  }
  addMark(markGroupIndex: number, tribeTag: string, options?: { skipUpdate?: boolean }): boolean {
    if (this.settings.turn === -1) return false;
    const markGroup = this.settings.markGroups[markGroupIndex];
    const tribe = this.findTribe(tribeTag);
    if (!tribe || !markGroup) return false;
    markGroup.tribes.push(tribe.id);
    this.sortMarkGroups();
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (options?.skipUpdate) return true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  addMarkGroup(group: MarkGroup, options?: { skipUpdate?: boolean }): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidGroupName(group.name) || !isValidColor(group.color)) return false;
    if (this.isGroupNameTaken(group.name)) return false;
    const newGroup: MarkGroup = {
      tribes: [],
      name: group.name,
      color: group.color,
    };
    this.settings.markGroups.push(newGroup);
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (options?.skipUpdate) return true;
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    return true;
  }
  async applySettings(settings: Settings): Promise<boolean> {
    if (!isValidSettings(settings)) return false;
    const isWorldChanged = await this.changeWorld(settings.world);
    if (!isWorldChanged) return false;
    this.settings.backgroundColor = settings.backgroundColor;
    this.settings.borderColor = settings.borderColor;
    this.settings.drawBorders = settings.drawBorders;
    this.settings.drawLegend = settings.drawLegend;
    this.settings.legendFontSize = settings.legendFontSize;
    this.settings.outputWidth = settings.outputWidth;
    this.settings.scale = settings.scale;
    this.settings.topSpotSize = settings.topSpotSize;
    this.settings.trim = settings.trim;
    const isTurnChanged = await this.changeTurn(settings.turn);
    if (!isTurnChanged) return false;
    this.settings.markGroups = [];
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
        if (tribe) this.addMark(this.settings.markGroups.length - 1, tribe.tag, { skipUpdate: true });
      }
    }
    for (const caption of settings.captions) {
      this.addCaption(caption, { skipUpdate: true });
    }
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#captionsTab.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  changeCaptionColor(captionIndex: number, newColor: string): boolean {
    const caption = this.settings.captions[captionIndex];
    if (!caption) return false;
    if (!isValidColor(newColor)) return false;
    caption.color = newColor;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  changeCaptionFontSize(captionIndex: number, newFontSize: number): boolean {
    const caption = this.settings.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionFontSize(newFontSize)) return false;
    caption.fontSize = newFontSize;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  changeCaptionText(captionIndex: number, newText: string): boolean {
    const caption = this.settings.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionText(newText)) return false;
    caption.text = newText;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  changeCaptionX(captionIndex: number, newX: number): boolean {
    const caption = this.settings.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionCoordinate(newX)) return false;
    caption.x = newX;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  changeCaptionY(captionIndex: number, newY: number): boolean {
    const caption = this.settings.captions[captionIndex];
    if (!caption) return false;
    if (!isValidCaptionCoordinate(newY)) return false;
    caption.y = newY;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  changeMarkGroupColor(markGroupIndex: number, newColor: string): boolean {
    if (this.settings.turn === -1) return false;
    const markGroup = this.settings.markGroups[markGroupIndex];
    if (!markGroup) return false;
    if (!isValidColor(newColor)) return false;
    markGroup.color = newColor;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    return true;
  }
  changeMarkGroupName(markGroupIndex: number, newName: string): boolean {
    if (this.settings.turn === -1) return false;
    const markGroup = this.settings.markGroups[markGroupIndex];
    if (!markGroup) return false;
    if (!isValidGroupName(newName)) return false;
    if (this.isGroupNameTaken(newName)) return false;
    markGroup.name = newName;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  async changeTurn(turn: number, options?: { skipUpdate?: boolean }): Promise<boolean> {
    const isTurnDataAvailable = await this.fetchTurnData(turn);
    if (!isTurnDataAvailable) {
      this.settings.turn = -1;
      this.#mapGenerator = undefined;
      return false;
    }
    this.settings.turn = turn;
    for (let group of this.settings.markGroups) {
      for (let tribeIndex = group.tribes.length - 1; tribeIndex >= 0; tribeIndex--) {
        const tribeId = group.tribes[tribeIndex];
        if (!this.tribes[tribeId]) {
          group.tribes.splice(tribeIndex, 1);
        }
      }
    }
    this.#mapGenerator = new MapGenerator(this.data[this.settings.turn], this.settings);
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (options?.skipUpdate) return true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  async changeWorld(world: number): Promise<boolean> {
    if (!isValidId(world)) return false;
    if (world === this.settings.world) return true;
    const endpoint = `/api/world/read/${world}`;
    const worldInfo: Awaited<ReturnType<typeof handleReadWorld>> = await getRequest(endpoint);
    this.data = {};
    this.settings.turn = -1;
    if (!worldInfo) return false;
    this.settings.world = world;
    this.latestTurn = Math.floor((Date.now() - worldInfo.startTimestamp * 1000) / 1000 / 60 / 60 / 24);
    this.#settingsTab.update();
    return true;
  }
  deleteCaption(captionIndex: number): boolean {
    if (!this.settings.captions[captionIndex]) return false;
    this.settings.captions.splice(captionIndex, 1);
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    this.#captionsTab.render();
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  deleteMark(markGroupIndex: number, tribeTag: string): boolean {
    if (this.settings.turn === -1) return false;
    const markGroup = this.settings.markGroups[markGroupIndex];
    if (!markGroup) return false;
    const tribeIndex = markGroup.tribes.findIndex((tribeId) => this.tribes[tribeId].tag === tribeTag);
    if (tribeIndex === -1) return false;
    markGroup.tribes.splice(tribeIndex, 1);
    this.sortMarkGroups();
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  deleteMarkGroup(markGroupIndex: number): boolean {
    if (!this.settings.markGroups[markGroupIndex]) return false;
    this.settings.markGroups.splice(markGroupIndex, 1);
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#markGroupsTab.render();
    this.#settingsTab.update();
    this.#suggestionsTab.render();
    return true;
  }
  async fetchTurnData(turn: number): Promise<boolean> {
    if (this.settings.world === 0) return false;
    if (!isValidTurn(turn)) return false;
    if (typeof this.data[turn] === "object") return true;
    const endpoint = `/api/turn-data/read/${this.settings.world}/${turn}`;
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
    this.#canvasFrame.render();
  };
  getMapImageData(): ImageData | null {
    if (!isValidSettings(this.settings)) return null;
    if (typeof this.data[this.settings.turn] !== "object") return null;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    const mapImageData = this.#mapGenerator.getMap();
    return mapImageData;
  }
  getSuggestions(tag: string, limit = MAX_TRIBE_SUGGESTIONS): Tribe[] {
    const tribes = this.tribes;
    if (!tribes) return [];
    const suggestions: Tribe[] = [];
    for (const tribeId in tribes) {
      if (tribes[tribeId].tag.includes(tag) || tag === "") suggestions.push(tribes[tribeId]);
    }
    for (const group of this.settings.markGroups) {
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
    for (const group of this.settings.markGroups) {
      if (group.name === name) return true;
    }
    return false;
  }
  setBackgroundColor(color: string): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.settings.backgroundColor = color;
    console.log("controller: ", this.settings.backgroundColor);
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setBorderColor(color: string): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidColor(color)) return false;
    this.settings.borderColor = color;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setDrawBorders(value: boolean): boolean {
    if (this.settings.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.settings.drawBorders = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setDrawLegend(value: boolean): boolean {
    if (this.settings.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.settings.drawLegend = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setOutputWidth(value: number): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidOutputWidth(value)) return false;
    this.settings.outputWidth = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setLegendFontSize(value: number): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidLegendFontSize(value)) return false;
    this.settings.legendFontSize = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isImageDataStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setScale(value: number): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidScale(value)) return false;
    this.settings.scale = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setSmoothBorders(value: boolean): boolean {
    if (this.settings.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.settings.smoothBorders = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setTopSpotSize(value: number): boolean {
    if (this.settings.turn === -1) return false;
    if (!isValidTopSpotSize(value)) return false;
    this.settings.topSpotSize = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isPixelsInfluenceStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  setTrim(value: boolean): boolean {
    if (this.settings.turn === -1) return false;
    if (typeof value !== "boolean") return false;
    this.settings.trim = value;
    if (!this.#mapGenerator) throw new Error("GeneratorController: map generator is undefined");
    this.#mapGenerator.isRawPixelsStageModified = true;
    if (this.autoRefresh) this.#canvasFrame.render();
    this.#settingsTab.update();
    return true;
  }
  sortMarkGroups() {
    const sums: { [key: string]: number } = {};
    for (let group of this.settings.markGroups) {
      sums[group.name] = group.tribes.reduce((sum, tribeId) => sum + this.tribes[tribeId].points, 0);
    }
    this.settings.markGroups.sort((a, b) => sums[b.name] - sums[a.name]);
  }
}

export default GeneratorController;
