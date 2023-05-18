import GeneratorController from "./GeneratorController.js";
import { decodeSettings, encodeSettings } from "../settings-codec.js";
import MarkGroupsTabController from "./MarkGroupsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";
import CanvasController from "./Canvas.js";
import { Settings } from "../../../Types.js";

const inputs: { [key: string]: HTMLInputElement } = {
  autoRefresh: document.getElementById("auto-refresh") as HTMLInputElement,
  backgroundColor: document.getElementById("background-color") as HTMLInputElement,
  villageFilter: document.getElementById("village-filter") as HTMLInputElement,
  radius: document.getElementById("radius") as HTMLInputElement,
  scale: document.getElementById("scale") as HTMLInputElement,
  spotsFilter: document.getElementById("spots-filter") as HTMLInputElement,
  spotSize: document.getElementById("spot-size") as HTMLInputElement,
};
const encodedSettings = document.getElementById("encoded-settings") as HTMLInputElement;
const worldSelect = document.getElementById("world-select") as HTMLSelectElement;
const turnInput = document.getElementById("turn-input") as HTMLInputElement;

class SettingsTabController {
  #generator: GeneratorController;
  #canvasObject: CanvasController | undefined;
  #markGroupsObject: MarkGroupsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #inputs;
  #encodedSettings: HTMLInputElement;
  #worldSelectElement: HTMLSelectElement;
  #turnInputElement: HTMLInputElement;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    this.#inputs = inputs;
    this.#encodedSettings = encodedSettings;
    this.#worldSelectElement = worldSelect;
    this.#turnInputElement = turnInput;
    this.#inputs.autoRefresh.addEventListener("input", this.autoRefreshChange);
    this.#inputs.backgroundColor.addEventListener("input", this.backgroundColorChange);
    this.#inputs.radius.addEventListener("input", this.radiusChange);
    this.#inputs.scale.addEventListener("input", this.scaleChange);
    this.#inputs.spotsFilter.addEventListener("input", this.spotsFilterChange);
    this.#inputs.spotSize.addEventListener("input", this.spotSizeChange);
    this.#inputs.villageFilter.addEventListener("input", this.villageFilterChange);
    this.#worldSelectElement.addEventListener("change", this.changeSelectedWorld);
    this.#turnInputElement.addEventListener("input", this.changeSelectedTurn);
    this.#encodedSettings.addEventListener("input", this.encodedSettingsChange);
    this.#encodedSettings.addEventListener("click", (e: Event) => {
      this.#encodedSettings.select();
    });
    this.disabled = true;
  }

  set disabled(value: boolean) {
    const inputs = this.#inputs;
    for (const key in inputs) {
      const setting = key as keyof typeof inputs;
      inputs[setting].disabled = value;
    }
  }
  set canvasObject(object: CanvasController) {
    this.#canvasObject = object;
    this.#inputs.autoRefresh.checked = this.#canvasObject.autoRefresh;
  }
  set markGroupsObject(object: MarkGroupsTabController) {
    this.#markGroupsObject = object;
  }
  set suggestionsObject(object: SuggestionsTabController) {
    this.#suggestionsObject = object;
  }
  update() {
    const settings = this.#generator.settings;
    const encodedSettings = encodeSettings(settings);
    const inputs = this.#inputs;
    for (const key in inputs) {
      const inputsKey = key as keyof typeof inputs;
      const input = inputs[inputsKey];
      const settingsKey = key as keyof Settings;
      input.value = String(settings[settingsKey]);
    }
    this.#encodedSettings.value = encodedSettings;
  }
  renderCanvas() {
    if (this.#canvasObject) this.#canvasObject.render();
  }
  renderMarkGroups() {
    if (this.#markGroupsObject) this.#markGroupsObject.render();
  }
  renderSuggestions() {
    if (this.#suggestionsObject) this.#suggestionsObject.render();
  }
  backgroundColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const result = this.#generator.setBackgroundColor(target.value);
    if (!result) {
      this.#inputs.backgroundColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.backgroundColor.classList.remove("is-invalid");
  };
  scaleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setScale(value);
    if (!result) {
      this.#inputs.scale.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.scale.classList.remove("is-invalid");
  };
  spotSizeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setSpotSize(value);
    if (!result) {
      this.#inputs.spotSize.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.spotSize.classList.remove("is-invalid");
  };
  autoRefreshChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    if (this.#canvasObject) this.#canvasObject.autoRefresh = value;
    this.update();
  };
  villageFilterChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setVillageFilter(value);
    if (!result) {
      this.#inputs.villageFilter.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.villageFilter.classList.remove("is-invalid");
  };
  spotsFilterChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setSpotsFilter(value);
    if (!result) {
      this.#inputs.spotsFilter.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.spotsFilter.classList.remove("is-invalid");
  };
  radiusChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setRadius(value);
    if (!result) {
      this.#inputs.radius.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.radius.classList.remove("is-invalid");
  };
  encodedSettingsChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    if (value === "") {
      this.#encodedSettings.classList.remove("is-invalid");
      return;
    }
    const decodedSettings = decodeSettings(value);
    if (!decodedSettings || !(await this.#generator.applySettings(decodedSettings))) {
      this.#encodedSettings.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.renderMarkGroups();
    this.renderSuggestions();
    this.disabled = false;
    this.update();
    const worldIdString = String(this.#generator.world);
    this.#worldSelectElement.value = worldIdString;
    const turnString = String(this.#generator.turn);
    this.#turnInputElement.value = turnString;
    this.#turnInputElement.disabled = false;
    this.#encodedSettings.classList.remove("is-invalid");
  };
  changeSelectedWorld = async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const world = parseInt(target.value);
    turnInput.value = "";
    turnInput.disabled = true;
    const result = await this.#generator.fetchWorldInfo(world);
    if (!result) {
      this.disabled = true;
      this.#turnInputElement.disabled = true;
      this.#worldSelectElement.classList.add("is-invalid");
      return;
    }
    this.#turnInputElement.disabled = false;
    this.#worldSelectElement.classList.remove("is-invalid");
  };
  changeSelectedTurn = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const turn = parseInt(target.value);
    const result = await this.#generator.changeTurn(turn);
    if (!result) {
      turnInput.classList.add("is-invalid");
      this.disabled = true;
      return;
    }
    this.renderSuggestions();
    this.renderMarkGroups();
    this.renderCanvas();
    this.update();
    this.disabled = false;
    turnInput.classList.remove("is-invalid");
  };
  init() {
    this.#encodedSettings.dispatchEvent(new Event("input"));
  }
}

export default SettingsTabController;
