import GeneratorController from "./GeneratorController.js";
import { decodeSettings, encodeSettings } from "../settings-codec.js";
import MarkGroupsTabController from "./MarkGroupsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";
import CanvasController from "./Canvas.js";
import { Settings } from "../../../Types.js";

const inputs: { [key: string]: HTMLInputElement } = {
  autoRefresh: document.getElementById("auto-refresh") as HTMLInputElement,
  backgroundColor: document.getElementById("background-color") as HTMLInputElement,
  displayUnmarked: document.getElementById("display-unmarked") as HTMLInputElement,
  outputWidth: document.getElementById("output-width") as HTMLInputElement,
  radius: document.getElementById("radius") as HTMLInputElement,
  scale: document.getElementById("scale") as HTMLInputElement,
  spotsFilter: document.getElementById("spots-filter") as HTMLInputElement,
  spotSize: document.getElementById("spot-size") as HTMLInputElement,
  trim: document.getElementById("trim") as HTMLInputElement,
  unmarkedColor: document.getElementById("unmarked-color") as HTMLInputElement,
  villageFilter: document.getElementById("village-filter") as HTMLInputElement,
};
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement;
const worldSelect = document.getElementById("world-select") as HTMLSelectElement;
const turnInput = document.getElementById("turn-input") as HTMLInputElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const descriptionInput = document.getElementById("description") as HTMLInputElement;
const publishButton = document.getElementById("publish-button") as HTMLButtonElement | null;

class SettingsTabController {
  #generator: GeneratorController;
  #canvasObject: CanvasController | undefined;
  #markGroupsObject: MarkGroupsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #inputs;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    this.#inputs = inputs;
    this.#inputs.autoRefresh.addEventListener("input", this.autoRefreshChange);
    this.#inputs.backgroundColor.addEventListener("input", this.backgroundColorChange);
    this.#inputs.displayUnmarked.addEventListener("input", this.displayUnmarkedChange);
    this.#inputs.outputWidth.addEventListener("input", this.outputWidthChange);
    this.#inputs.radius.addEventListener("input", this.radiusChange);
    this.#inputs.scale.addEventListener("input", this.scaleChange);
    this.#inputs.spotsFilter.addEventListener("input", this.spotsFilterChange);
    this.#inputs.spotSize.addEventListener("input", this.spotSizeChange);
    this.#inputs.trim.addEventListener("input", this.trimChange);
    this.#inputs.villageFilter.addEventListener("input", this.villageFilterChange);
    this.#inputs.unmarkedColor.addEventListener("input", this.unmarkedColorChange);
    worldSelect.addEventListener("change", this.worldChange);
    turnInput.addEventListener("input", this.turnChange);
    encodedSettingsInput.addEventListener("input", this.encodedSettingsChange);
    encodedSettingsInput.addEventListener("click", (e: Event) => {
      encodedSettingsInput.select();
    });
    if (publishButton !== null) publishButton.addEventListener("click", this.publishMap);
  }

  set disabled(value: boolean) {
    const inputs = this.#inputs;
    for (const key in inputs) {
      const setting = key as keyof typeof inputs;
      inputs[setting].disabled = value;
    }
    if (publishButton !== null) {
      titleInput.disabled = value;
      descriptionInput.disabled = value;
      publishButton.disabled = value;
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
  init() {
    encodedSettingsInput.dispatchEvent(new Event("input"));
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
    encodedSettingsInput.value = encodedSettings;
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
  autoRefreshChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    if (this.#canvasObject) this.#canvasObject.autoRefresh = value;
    this.update();
  };
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
  displayUnmarkedChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    const result = this.#generator.setDisplayUnmarked(value);
    if (!result) {
      this.#inputs.displayUnmarked.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.displayUnmarked.classList.remove("is-invalid");
  };
  encodedSettingsChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    if (value === "") {
      encodedSettingsInput.classList.remove("is-invalid");
      return;
    }
    const decodedSettings = decodeSettings(value);
    if (!decodedSettings || !(await this.#generator.applySettings(decodedSettings))) {
      encodedSettingsInput.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.renderMarkGroups();
    this.renderSuggestions();
    this.disabled = false;
    this.update();
    const worldIdString = String(this.#generator.world);
    worldSelect.value = worldIdString;
    const turnString = String(this.#generator.turn);
    turnInput.value = turnString;
    turnInput.disabled = false;
    encodedSettingsInput.classList.remove("is-invalid");
  };
  outputWidthChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const result = this.#generator.setOutputWidth(value);
    if (!result) {
      this.#inputs.outputWidth.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.outputWidth.classList.remove("is-invalid");
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
  trimChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    const result = this.#generator.setTrim(value);
    if (!result) {
      this.#inputs.trim.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.trim.classList.remove("is-invalid");
  };
  turnChange = async (e: Event) => {
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
  unmarkedColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const result = this.#generator.setUnmarkedColor(target.value);
    if (!result) {
      this.#inputs.unmarkedColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.unmarkedColor.classList.remove("is-invalid");
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
  worldChange = async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const world = parseInt(target.value);
    turnInput.value = "";
    turnInput.disabled = true;
    const result = await this.#generator.changeWorld(world);
    if (!result) {
      this.disabled = true;
      turnInput.disabled = true;
      worldSelect.classList.add("is-invalid");
      return;
    }
    turnInput.disabled = false;
    worldSelect.classList.remove("is-invalid");
  };
  publishMap = async (e: Event) => {
    const url = `${window.location.origin}/api/map/create`;
    const settings = this.#generator.settings;
    const title = titleInput.value;
    const description = descriptionInput.value;
    const body = {
      settings: settings,
      title: title,
      description: description,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const createdMapId = await response.json();
    if (createdMapId > 0) console.log("Map published succesfully");
    else console.log("Failed to publish the map");
  };
}

export default SettingsTabController;
