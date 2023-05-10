import MapGenerator from "./MapGenerator.js";
import SettingsValidator from "./SettingsValidator.js";
import { distinctiveColor } from "../utils.js";
import { MarkGroup, Settings, ParsedTurnData, Tribe } from "../../../Types.js";

class GeneratorController {
  autoRefresh: boolean = true;
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
    this.generate();
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
    if (typeof settings !== "object") return false;
    if (!SettingsValidator.settings(settings)) return false;
    if (settings.world !== this.world) {
      const result = await this.fetchWorldInfo(settings.world);
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
    this.generate();
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
    if (turn < 0) {
      this.turn = -1;
      return false;
    }
    if (!SettingsValidator.turn(turn)) return false;
    if (this.data[turn] === undefined) {
      const result = await this.fetchTurnData(turn);
      if (result === false) return false;
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
    this.generate();
    return true;
  }
  deleteMark(groupName: string, tribeTag: string) {
    if (!this.world || !this.turn) return false;
    const group = this.markGroups.find((element) => element.name === groupName);
    if (group === undefined) return false;
    const tribeIndex = group.tribes.findIndex((tribeId) => this.tribes[tribeId].tag === tribeTag);
    if (tribeIndex === -1) return false;
    group.tribes.splice(tribeIndex, 1);
    this.generate();
    return true;
  }
  deleteMarkGroup(name: string) {
    const groupIndex = this.markGroups.findIndex((element) => element.name === name);
    if (groupIndex === -1) return false;
    this.markGroups.splice(groupIndex, 1);
    this.generate();
    return true;
  }
  async fetchTurnData(turn: number) {
    const world = this.world;
    if (world === 0) return false;
    const url = `http://${window.location.host}/api/data/${world}/${turn}`;
    const result = await fetch(url);
    const data = await result.json();
    if (data === null) return false;
    this.data[turn] = data;
    return true;
  }
  async fetchWorldInfo(world: number) {
    const info = await fetch(`http://${window.location.host}/api/world/${world}`)
      .then((r) => r.json())
      .then((data) => {
        this.data = {};
        this.#server = data.server + data.num;
        this.world = world;
        this.#worldStartTimestamp = data.start_timestamp;
        this.turn = -1;
        return this.info;
      });
    return info;
  }
  findTribe(name: string) {
    const turn = this.turn;
    if (!this.tribes) return false;
    // const tribes = Object.entries(this.data[turn].tribes);
    for (const tribeId in this.tribes) {
      if (this.tribes[tribeId].name === name) return this.tribes[tribeId];
    }
    return false;
  }
  generate() {
    const generator = new MapGenerator(this.data[this.turn], this.settings);
    return generator.imageData;
  }
  getSuggestions(tag: string, limit = 10) {
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
  setAutoRefresh(value: boolean) {
    this.autoRefresh = value;
    return true;
  }
  setBackgroundColor(color: string) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.color(color)) return false;
    this.#backgroundColor = color;
    this.generate();
    return true;
  }
  setRadius(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.radius(value)) return false;
    this.#radius = value;
    this.generate();
    return true;
  }
  setScale(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.scale(value)) return false;
    this.#scale = value;
    this.generate();
    return true;
  }
  setSpotsFilter(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.spotsFilter(value)) return false;
    this.#spotsFilter = value;
    this.generate();
    return true;
  }
  setSpotSize(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.spotSize(value)) return false;
    this.#spotSize = value;
    this.generate();
    return true;
  }
  setVillageFilter(value: number) {
    if (this.turn === -1) return false;
    if (!SettingsValidator.villageFilter(value)) return false;
    this.#villageFilter = value;
    this.generate();
    return true;
  }
}

export default GeneratorController;
