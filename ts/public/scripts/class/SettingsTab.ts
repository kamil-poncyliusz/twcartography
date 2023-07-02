import GeneratorController from "./GeneratorController.js";
import { decodeSettings, encodeSettings } from "../settings-codec.js";
import MarkGroupsTabController from "./MarkGroupsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";
import CanvasController from "./CanvasController.js";
import { handleCreateMap } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { CreateMapRequestValidationCode, validateCreateMapRequest } from "../requestValidators.js";
import { SETTINGS_LIMITS as LIMITS } from "../constants.js";
import { CreateMapRequestPayload, Settings } from "../../../src/Types.js";

const inputs: { [key: string]: HTMLInputElement } = {
  autoRefresh: document.getElementById("auto-refresh") as HTMLInputElement,
  backgroundColor: document.getElementById("background-color") as HTMLInputElement,
  borderColor: document.getElementById("border-color") as HTMLInputElement,
  displayUnmarked: document.getElementById("display-unmarked") as HTMLInputElement,
  outputWidth: document.getElementById("output-width") as HTMLInputElement,
  scale: document.getElementById("scale") as HTMLInputElement,
  spotsFilter: document.getElementById("spots-filter") as HTMLInputElement,
  trim: document.getElementById("trim") as HTMLInputElement,
  turn: document.getElementById("turn-input") as HTMLInputElement,
  unmarkedColor: document.getElementById("unmarked-color") as HTMLInputElement,
};
const descriptionInput = document.getElementById("description") as HTMLInputElement | null;
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement;
const collectionSelect = document.getElementById("collection") as HTMLSelectElement | null;
const publishButton = document.getElementById("publish-button") as HTMLButtonElement | null;
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const worldSelect = document.getElementById("world-select") as HTMLSelectElement;
const generate = document.getElementById("generate") as HTMLButtonElement;

class SettingsTabController {
  #generator: GeneratorController;
  #canvasObject: CanvasController | undefined;
  #markGroupsObject: MarkGroupsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  #generateButton: HTMLButtonElement;
  #worldSelect: HTMLSelectElement;
  #inputs;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    this.#generateButton = generate;
    this.#generateButton.addEventListener("click", this.generate);
    this.#inputs = inputs;
    this.#inputs.autoRefresh.addEventListener("input", this.autoRefreshChange);
    this.#inputs.backgroundColor.addEventListener("input", this.backgroundColorChange);
    this.#inputs.borderColor.addEventListener("input", this.borderColorChange);
    this.#inputs.displayUnmarked.addEventListener("input", this.displayUnmarkedChange);
    this.#inputs.outputWidth.addEventListener("input", this.outputWidthChange);
    this.#inputs.scale.addEventListener("input", this.scaleChange);
    this.#inputs.spotsFilter.addEventListener("input", this.spotsFilterChange);
    this.#inputs.trim.addEventListener("input", this.trimChange);
    this.#inputs.turn.addEventListener("input", this.turnChange);
    this.#inputs.unmarkedColor.addEventListener("input", this.unmarkedColorChange);
    this.#worldSelect = worldSelect;
    this.#worldSelect.addEventListener("change", this.worldChange);
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
    this.#generateButton.disabled = value;
    if (publishButton !== null) {
      if (titleInput) titleInput.disabled = value;
      if (descriptionInput) descriptionInput.disabled = value;
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
      const value = settings[settingsKey];
      if (typeof value === "boolean") input.checked = value;
      else input.value = String(value);
    }
    if (this.#worldSelect.classList.contains("is-invalid")) {
      this.disabled = true;
    } else if (this.#inputs.turn.classList.contains("is-invalid") || this.#inputs.turn.value === "-1") {
      this.disabled = true;
      this.#inputs.turn.disabled = false;
    } else {
      this.disabled = false;
      if (!this.#inputs.displayUnmarked.checked) this.#inputs.unmarkedColor.disabled = true;
      if (this.#inputs.trim.checked) this.#inputs.outputWidth.disabled = true;
      if (this.#inputs.autoRefresh.checked) this.#generateButton.disabled = true;
      encodedSettingsInput.value = encodedSettings;
    }
    const turnPlaceholder = this.#generator.latestTurn >= 0 ? `0-${this.#generator.latestTurn}` : "-";
    this.#inputs.turn.setAttribute("placeholder", turnPlaceholder);
    for (let setting in LIMITS.MIN) {
      this.#inputs[setting].setAttribute("min", String(LIMITS.MIN[setting]));
      this.#inputs[setting].setAttribute("placeholder", String(LIMITS.MIN[setting]) + "-");
    }
    for (let setting in LIMITS.MAX) {
      this.#inputs[setting].setAttribute("max", String(LIMITS.MAX[setting]));
      const current = this.#inputs[setting].getAttribute("placeholder");
      this.#inputs[setting].setAttribute("placeholder", current + String(LIMITS.MAX[setting]));
    }
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
  generate = (e: Event) => {
    if (this.#canvasObject) this.#canvasObject.forceRender();
  };
  autoRefreshChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    if (this.#canvasObject) this.#canvasObject.autoRefresh = value;
    this.update();
  };
  backgroundColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBackgroundColor(target.value);
    if (!isChanged) {
      this.#inputs.backgroundColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.backgroundColor.classList.remove("is-invalid");
  };
  borderColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBorderColor(target.value);
    if (!isChanged) {
      this.#inputs.borderColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.borderColor.classList.remove("is-invalid");
  };
  displayUnmarkedChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    const isChanged = this.#generator.setDisplayUnmarked(value);
    if (!isChanged) {
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
    encodedSettingsInput.classList.remove("is-invalid");
  };
  outputWidthChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const isChanged = this.#generator.setOutputWidth(value);
    if (!isChanged) {
      this.#inputs.outputWidth.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.outputWidth.classList.remove("is-invalid");
  };
  scaleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    const isChanged = this.#generator.setScale(value);
    if (!isChanged) {
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
    const isChanged = this.#generator.setSpotsFilter(value);
    if (!isChanged) {
      this.#inputs.spotsFilter.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.spotsFilter.classList.remove("is-invalid");
  };
  trimChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.checked;
    const isChanged = this.#generator.setTrim(value);
    if (!isChanged) {
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
    const isChanged = await this.#generator.changeTurn(turn);
    if (!isChanged) return this.#inputs.turn.classList.add("is-invalid");
    this.renderSuggestions();
    this.renderMarkGroups();
    this.renderCanvas();
    this.#inputs.turn.classList.remove("is-invalid");
    this.update();
  };
  unmarkedColorChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const isChanged = this.#generator.setUnmarkedColor(target.value);
    if (!isChanged) {
      this.#inputs.unmarkedColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    this.#inputs.unmarkedColor.classList.remove("is-invalid");
  };
  worldChange = async (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const world = parseInt(target.value);
    const isChanged = await this.#generator.changeWorld(world);
    if (!isChanged) return worldSelect.classList.add("is-invalid");
    worldSelect.classList.remove("is-invalid");
    this.update();
    this.#inputs.turn.value = "";
  };
  publishMap = async (e: Event) => {
    const settings = this.#generator.settings;
    if (!titleInput || !descriptionInput || !collectionSelect) return;
    const title = titleInput.value;
    const description = descriptionInput.value;
    const collection = parseInt(collectionSelect.value);
    const payload: CreateMapRequestPayload = {
      settings: settings,
      title: title,
      description: description,
      collection: collection,
    };
    const payloadValidationCode = validateCreateMapRequest(payload);
    switch (payloadValidationCode) {
      case CreateMapRequestValidationCode.InvalidCollection: {
        collectionSelect.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.InvalidDescription: {
        descriptionInput.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.InvalidSettings: {
        console.log("Publish map: Invalid settings");
        break;
      }
      case CreateMapRequestValidationCode.InvalidTitle: {
        titleInput.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.Ok: {
        const createdMapId: Awaited<ReturnType<typeof handleCreateMap>> = await postRequest("/api/map/create", payload);
        if (createdMapId === false) console.log("Failed to publish the map");
        else console.log("Map published succesfully");
        collectionSelect.classList.remove("is-invalid");
      }
    }
  };
}

export default SettingsTabController;
