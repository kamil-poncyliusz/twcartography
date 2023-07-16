import GeneratorController from "./GeneratorController.js";
import { decodeSettings, encodeSettings } from "../settings-codec.js";
import MarkGroupsTabController from "./MarkGroupsTab.js";
import SuggestionsTabController from "./SuggestionsTab.js";
import CanvasController from "./CanvasController.js";
import { handleCreateMap } from "../../../routes/api-handlers.js";
import { postRequest } from "../requests.js";
import { CreateMapRequestValidationCode, isValidCreateMapRequestPayload, settingsLimits } from "../validators.js";
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
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement | null;
const collectionSelect = document.getElementById("collection") as HTMLSelectElement | null;
const publishButton = document.getElementById("publish-button") as HTMLButtonElement | null;
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const worldSelect = document.getElementById("world-select") as HTMLSelectElement | null;
const generateButton = document.getElementById("generate") as HTMLButtonElement | null;

class SettingsTabController {
  #generator: GeneratorController;
  #canvasObject: CanvasController | undefined;
  #markGroupsObject: MarkGroupsTabController | undefined;
  #suggestionsObject: SuggestionsTabController | undefined;
  constructor(mapGeneratorObject: GeneratorController) {
    this.#generator = mapGeneratorObject;
    if (generateButton) generateButton.addEventListener("click", this.generate);
    inputs.autoRefresh.addEventListener("input", this.autoRefreshChange);
    inputs.backgroundColor.addEventListener("input", this.backgroundColorChange);
    inputs.borderColor.addEventListener("input", this.borderColorChange);
    inputs.displayUnmarked.addEventListener("input", this.displayUnmarkedChange);
    inputs.outputWidth.addEventListener("input", this.outputWidthChange);
    inputs.scale.addEventListener("input", this.scaleChange);
    inputs.spotsFilter.addEventListener("input", this.spotsFilterChange);
    inputs.trim.addEventListener("input", this.trimChange);
    inputs.turn.addEventListener("input", this.turnChange);
    inputs.unmarkedColor.addEventListener("input", this.unmarkedColorChange);
    if (worldSelect) worldSelect.addEventListener("change", this.worldChange);
    if (encodedSettingsInput) {
      encodedSettingsInput.addEventListener("input", this.encodedSettingsChange);
      encodedSettingsInput.addEventListener("click", (e: Event) => {
        encodedSettingsInput.select();
      });
    }
    if (publishButton !== null) publishButton.addEventListener("click", this.publishMap);
  }

  set disabled(value: boolean) {
    for (const key in inputs) {
      inputs[key].disabled = value;
    }
    if (generateButton) generateButton.disabled = value;
    if (publishButton !== null) {
      if (titleInput) titleInput.disabled = value;
      if (descriptionInput) descriptionInput.disabled = value;
      publishButton.disabled = value;
    }
  }
  set canvasObject(object: CanvasController) {
    this.#canvasObject = object;
    inputs.autoRefresh.checked = this.#canvasObject.autoRefresh;
  }
  set markGroupsObject(object: MarkGroupsTabController) {
    this.#markGroupsObject = object;
  }
  set suggestionsObject(object: SuggestionsTabController) {
    this.#suggestionsObject = object;
  }
  init() {
    if (encodedSettingsInput) encodedSettingsInput.dispatchEvent(new Event("input"));
  }
  update() {
    if (!worldSelect) return;
    const settings = this.#generator.settings;
    const encodedSettings = encodeSettings(settings);
    for (const key in inputs) {
      const inputsKey = key as keyof typeof inputs;
      const input = inputs[inputsKey];
      const settingsKey = key as keyof Settings;
      const value = settings[settingsKey];
      if (typeof value === "boolean") input.checked = value;
      else input.value = String(value);
    }
    if (worldSelect.classList.contains("is-invalid")) {
      this.disabled = true;
    } else if (inputs.turn.classList.contains("is-invalid") || inputs.turn.value === "-1") {
      this.disabled = true;
      inputs.turn.disabled = false;
    } else {
      this.disabled = false;
      if (!inputs.displayUnmarked.checked) inputs.unmarkedColor.disabled = true;
      if (inputs.trim.checked) inputs.outputWidth.disabled = true;
      if (inputs.autoRefresh.checked && generateButton) generateButton.disabled = true;
      if (encodedSettingsInput) encodedSettingsInput.value = encodedSettings;
    }
    const turnPlaceholder = this.#generator.latestTurn >= 0 ? `0-${this.#generator.latestTurn}` : "-";
    inputs.turn.setAttribute("placeholder", turnPlaceholder);
    for (let setting in settingsLimits.min) {
      inputs[setting].setAttribute("min", String(settingsLimits.min[setting]));
      inputs[setting].setAttribute("placeholder", String(settingsLimits.min[setting]) + "-");
    }
    for (let setting in settingsLimits.max) {
      inputs[setting].setAttribute("max", String(settingsLimits.max[setting]));
      const current = inputs[setting].getAttribute("placeholder");
      inputs[setting].setAttribute("placeholder", current + String(settingsLimits.max[setting]));
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
    const colorInput = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBackgroundColor(colorInput.value);
    if (!isChanged) {
      inputs.backgroundColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.backgroundColor.classList.remove("is-invalid");
  };
  borderColorChange = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBorderColor(colorInput.value);
    if (!isChanged) {
      inputs.borderColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.borderColor.classList.remove("is-invalid");
  };
  displayUnmarkedChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setDisplayUnmarked(value);
    if (!isChanged) {
      inputs.displayUnmarked.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.displayUnmarked.classList.remove("is-invalid");
  };
  encodedSettingsChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;
    if (value === "") {
      input.classList.remove("is-invalid");
      return;
    }
    const decodedSettings = decodeSettings(value);
    if (!decodedSettings || !(await this.#generator.applySettings(decodedSettings))) {
      input.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.renderMarkGroups();
    this.renderSuggestions();
    this.disabled = false;
    this.update();
    const worldIdString = String(this.#generator.world);
    if (worldSelect) worldSelect.value = worldIdString;
    input.classList.remove("is-invalid");
  };
  outputWidthChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setOutputWidth(value);
    if (!isChanged) {
      inputs.outputWidth.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.outputWidth.classList.remove("is-invalid");
  };
  scaleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setScale(value);
    if (!isChanged) {
      inputs.scale.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.scale.classList.remove("is-invalid");
  };
  spotsFilterChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setSpotsFilter(value);
    if (!isChanged) {
      inputs.spotsFilter.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.spotsFilter.classList.remove("is-invalid");
  };
  trimChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setTrim(value);
    if (!isChanged) {
      inputs.trim.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.trim.classList.remove("is-invalid");
  };
  turnChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const turn = parseInt(input.value);
    const isChanged = await this.#generator.changeTurn(turn);
    if (!isChanged) return inputs.turn.classList.add("is-invalid");
    inputs.turn.classList.remove("is-invalid");
    this.renderSuggestions();
    this.renderMarkGroups();
    this.renderCanvas();
    this.update();
  };
  unmarkedColorChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const isChanged = this.#generator.setUnmarkedColor(input.value);
    if (!isChanged) {
      inputs.unmarkedColor.classList.add("is-invalid");
      return;
    }
    this.renderCanvas();
    this.update();
    inputs.unmarkedColor.classList.remove("is-invalid");
  };
  worldChange = async (e: Event) => {
    if (!worldSelect) return;
    const selectElement = e.target as HTMLSelectElement;
    const world = parseInt(selectElement.value);
    const isChanged = await this.#generator.changeWorld(world);
    if (!isChanged) return worldSelect.classList.add("is-invalid");
    worldSelect.classList.remove("is-invalid");
    this.update();
    inputs.turn.value = "";
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
    const payloadValidationCode = isValidCreateMapRequestPayload(payload);
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
        if (createdMapId === 0) console.log("Failed to publish the map");
        else console.log("Map published succesfully");
        collectionSelect.classList.remove("is-invalid");
      }
    }
  };
}

export default SettingsTabController;
