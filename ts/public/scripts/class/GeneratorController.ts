import MapGenerator from "./MapGenerator.js";
import SettingsValidator from "./SettingsValidator.js";
import { distinctiveColor } from "../utils.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe } from "../../../Types.js";
import { readWorld, readWorldData } from "../../../src/queries/index.js";

class GeneratorController {
  #backgroundColor: string = "#000000";
  data: { [key: number]: ParsedTurnData } = {};
  info: {} = {};
  markGroups: MarkGroup[] = [];
  #spotsFilter: number = 5;
  #radius: number = 500;
  #scale: number = 2;
  #server: string = "";
  #spotSize: number = 3;
  turn: number = -1;
  #villageFilter: number = 1000;
  world: number = 0;
  #worldStartTimestamp: number = 0;
  constructor() {}
  get settings(): Settings {
    return {
      backgroundColor: this.#backgroundColor,
      markGroups: this.markGroups,
      radius: this.#radius,
      scale: this.#scale,
      spotsFilter: this.#spotsFilter,
      spotSize: this.#spotSize,
      turn: this.turn,
      villageFilter: this.#villageFilter,
      world: this.world,
    };
  }
  get tribes(): { [key: string]: Tribe } {
    if (this.world === 0 || this.turn === -1) return {};
    return this.data[this.turn].tribes;
  }
  addMark(tribeName: string, groupName: string) {
    if (!this.world || !this.turn) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribe = this.findTribe(tribeName);
    if (!tribe) return false;
    group.tribes.push(tribe.id);
    return true;
  }
  addMarkGroup(group: MarkGroup) {
    if (!this.world || !this.turn) return false;
    if (!SettingsValidator.groupName(group.name) || !SettingsValidator.color(group.color)) return false;
    if (this.groupNameTaken(group.name)) return false;
    if (group.color === "#FFFFFF") group.color = distinctiveColor(this.markGroups.length);
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
      const result = await this.changeWorld(settings.world);
      if (!result) return false;
      const res = await this.changeTurn(settings.turn);
      if (!res) return false;
    }
    this.setBackgroundColor(settings.backgroundColor);
    this.setRadius(settings.radius);
    this.setScale(settings.scale);
    this.setSpotsFilter(settings.spotsFilter);
    this.setSpotSize(settings.spotSize);
    this.setVillageFilter(settings.villageFilter);
    this.markGroups = [];
    for (let group of settings.markGroups) {
      this.addMarkGroup({
        tribes: [],
        name: group.name,
        color: group.color,
      });
      for (let tribeId of group.tribes) {
        const tribe = this.tribes[tribeId];
        if (tribe) this.addMark(tribe.name, group.name);
      }
    }
    return true;
  }
  changeMarkGroupColor(name: string, color: string) {
    if (!this.world || !this.turn) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    const group = this.markGroups[groupIndex];
    group.color = color;
    return true;
  }
  changeMarkGroupName(oldName: string, name: string) {
    if (!this.world || !this.turn) return false;
    const groupIndex = this.markGroups.findIndex((element) => element.name === oldName);
    if (groupIndex === -1) return false;
    const group = this.markGroups[groupIndex];
    if (!SettingsValidator.groupName(name)) return false;
    if (this.groupNameTaken(name)) return false;
    group.name = name;
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
        const tribeId = group.tribes[tribeIndex];
        if (!this.tribes[tribeId]) {
          group.tribes.splice(tribeIndex, 1);
        }
      }
    }
    return true;
  }
  async changeWorld(world: number) {
    const response = await fetch(`${window.location.origin}/api/world/${world}`);
    const worldInfo: Awaited<ReturnType<typeof readWorld>> = await response.json();
    this.data = {};
    this.turn = -1;
    if (worldInfo === null) {
      return false;
    }
    this.#server = worldInfo.server + worldInfo.num;
    this.world = world;
    this.#worldStartTimestamp = worldInfo.start_timestamp;
    return true;
  }
  deleteMark(groupName: string, tribeTag: string) {
    if (!this.world || !this.turn) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribeIndex = group.tribes.findIndex((tribeId) => this.tribes[tribeId].tag === tribeTag);
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
    if (this.data[turn] !== undefined) return true;
    const url = `${window.location.origin}/api/data/${this.world}/${turn}`;
    const response = await fetch(url);
    const turnData: Awaited<ReturnType<typeof readWorldData>> = await response.json();
    if (turnData === null) return false;
    this.data[turn] = turnData;
    return true;
  }
  findTribe(name: string) {
    if (!this.tribes) return false;
    for (const tribeId in this.tribes) {
      if (this.tribes[tribeId].name === name) return this.tribes[tribeId];
    }
    return false;
  }
  getMapImageData() {
    const generator = new MapGenerator(this.data[this.turn], this.settings);
    return generator.imageData as ImageData;
  }
  getSuggestions(tag: string, limit = 15) {
    const tribes = this.tribes;
    if (!tribes) return false;
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
  groupNameTaken(name: string) {
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
  setRadius(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.radius(value)) return false;
    this.#radius = value;
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
  setSpotSize(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.spotSize(value)) return false;
    this.#spotSize = value;
    return true;
  }
  setVillageFilter(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.villageFilter(value)) return false;
    this.#villageFilter = value;
    return true;
  }
}

export default GeneratorController;
