import GeneratorController from "./generator-controller.js";
import { decodeJsonSettings, encodeJsonSettings } from "../settings-codec.js";
import { handleCreateMap } from "../../../routes/api/map-handlers.js";
import { HttpMethod, httpRequest } from "../requests.js";
import { isValidId, settingsLimits } from "../validators.js";
import { selectInputValue } from "../generator-controller-helpers.js";
import { CreateMapRequestValidationCode, isValidCreateMapRequestPayload } from "../requests-validators.js";
import { CreateMapRequestPayload, CreateMapResponse, Settings } from "../../../src/types";
import { getPreferredTranslation } from "../languages.js";

const acceptedLanguages = [...navigator.languages];
const translation = getPreferredTranslation(acceptedLanguages);

const inputs: { [key: string]: HTMLInputElement } = {
  autoRefresh: document.getElementById("auto-refresh") as HTMLInputElement,
  backgroundColor: document.getElementById("background-color") as HTMLInputElement,
  borderColor: document.getElementById("border-color") as HTMLInputElement,
  drawBorders: document.getElementById("draw-borders") as HTMLInputElement,
  drawLegend: document.getElementById("draw-legend") as HTMLInputElement,
  legendFontSize: document.getElementById("legend-font-size") as HTMLInputElement,
  outputWidth: document.getElementById("output-width") as HTMLInputElement,
  scale: document.getElementById("scale") as HTMLInputElement,
  smoothBorders: document.getElementById("smooth-borders") as HTMLInputElement,
  topSpotSize: document.getElementById("top-spot-size") as HTMLInputElement,
  trim: document.getElementById("trim") as HTMLInputElement,
};
const dayInput = document.getElementById("day-input") as HTMLInputElement;
const mapSettingsInput = document.getElementById("map-settings") as HTMLInputElement;
const worldSelect = document.getElementById("world-select") as HTMLSelectElement;
const collectionSelect = document.getElementById("collection") as HTMLSelectElement | null;
const generateButton = document.getElementById("generate") as HTMLButtonElement | null;
const publishMapButton = document.getElementById("publish-button") as HTMLButtonElement | null;
const mapDescriptionInput = document.getElementById("map-description") as HTMLInputElement | null;
const mapTitleInput = document.getElementById("map-title") as HTMLInputElement | null;

const addNewCollectionOption = function (newCollection: CreateMapResponse["newCollection"]) {
  if (!newCollection) return console.log("Cannot add new option, new collection is null");
  const newOptionElement = document.createElement("option");
  newOptionElement.value = String(newCollection.id);
  newOptionElement.innerHTML = newCollection.title;
  newOptionElement.dataset.worldId = String(newCollection.worldId);
  newOptionElement.selected = true;
  collectionSelect?.add(newOptionElement);
};

const sendAndHandleCreateMapRequest = async function (payload: CreateMapRequestPayload) {
  if (!publishMapButton) throw new Error("Publish map button is null");
  publishMapButton.disabled = true;
  publishMapButton.innerHTML = translation.waiting;
  const method = HttpMethod.POST;
  const createMapResponse: Awaited<ReturnType<typeof handleCreateMap>> = await httpRequest("/api/map", method, payload);
  if (!createMapResponse.success) {
    publishMapButton.innerHTML = translation.errorOccurred;
    publishMapButton.classList.add("danger");
    return console.log("Failed to publish the map");
  }
  if (createMapResponse.newCollection) addNewCollectionOption(createMapResponse.newCollection);
  publishMapButton.innerHTML = translation.mapAddedToCollection;
  publishMapButton.classList.add("success");
  console.log("Map published succesfully");
};

class SettingsTab {
  #generator: GeneratorController;
  constructor(generatorController: GeneratorController) {
    this.#generator = generatorController;
    generateButton?.addEventListener("click", this.#generator.forceRenderCanvas);
    inputs.autoRefresh.addEventListener("input", this.changeAutoRefresh);
    inputs.backgroundColor.addEventListener("change", this.changeBackgroundColor);
    inputs.borderColor.addEventListener("change", this.changeBorderColor);
    inputs.drawBorders.addEventListener("change", this.changeDrawBorders);
    inputs.drawLegend.addEventListener("change", this.changeDrawLegend);
    inputs.legendFontSize.addEventListener("change", this.changeLegendFontSize);
    inputs.outputWidth.addEventListener("change", this.changeOutputWidth);
    inputs.scale.addEventListener("change", this.changeScale);
    inputs.smoothBorders.addEventListener("change", this.changeSmoothBorders);
    inputs.topSpotSize.addEventListener("change", this.changeTopSpotSize);
    inputs.trim.addEventListener("input", this.changeTrim);
    dayInput.addEventListener("change", this.changeTurn);
    worldSelect.addEventListener("change", this.changeWorld);
    mapSettingsInput.addEventListener("click", selectInputValue);
    mapSettingsInput.addEventListener("input", this.changeSettings);
    mapSettingsInput.dispatchEvent(new Event("input"));
    publishMapButton?.addEventListener("click", this.publishMap);
  }
  set disabled(value: boolean) {
    for (const key in inputs) {
      inputs[key].disabled = value;
    }
    dayInput.disabled = value;
    if (generateButton) generateButton.disabled = value;
    if (publishMapButton) publishMapButton.disabled = value;
    if (mapTitleInput) mapTitleInput.disabled = value;
    if (mapDescriptionInput) mapDescriptionInput.disabled = value;
  }
  changeAutoRefresh = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.#generator.autoRefresh = target.checked;
    this.update();
  };
  changeBackgroundColor = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBackgroundColor(colorInput.value);
    if (isChanged) inputs.backgroundColor.classList.remove("is-invalid");
    else inputs.backgroundColor.classList.add("is-invalid");
  };
  changeBorderColor = (e: Event) => {
    const colorInput = e.target as HTMLInputElement;
    const isChanged = this.#generator.setBorderColor(colorInput.value);
    if (isChanged) inputs.borderColor.classList.remove("is-invalid");
    else inputs.borderColor.classList.add("is-invalid");
  };
  changeDrawBorders = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setDrawBorders(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeDrawLegend = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setDrawLegend(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeLegendFontSize = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setLegendFontSize(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeSettings = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const settingsInputValue = input.value;
    if (settingsInputValue === "") return input.classList.remove("is-invalid");
    const decodedSettings = decodeJsonSettings(settingsInputValue);
    if (!(await this.#generator.applySettings(decodedSettings))) return input.classList.add("is-invalid");
    input.classList.remove("is-invalid");
  };
  changeOutputWidth = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setOutputWidth(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeScale = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setScale(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeSmoothBorders = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setSmoothBorders(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeTopSpotSize = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = Number(input.value);
    const isChanged = this.#generator.setTopSpotSize(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeTrim = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.checked;
    const isChanged = this.#generator.setTrim(value);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeTurn = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const day = input.value;
    const isChanged = await this.#generator.changeTurn(day);
    if (isChanged) input.classList.remove("is-invalid");
    else input.classList.add("is-invalid");
  };
  changeWorld = async (e: Event) => {
    const selectElement = e.target as HTMLSelectElement;
    const world = parseInt(selectElement.value);
    const isChanged = await this.#generator.changeWorld(world);
    if (isChanged) selectElement.classList.remove("is-invalid");
    else selectElement.classList.add("is-invalid");
  };
  publishMap = async (e: Event) => {
    const settings = this.#generator.settings;
    if (!mapTitleInput || !mapDescriptionInput || !collectionSelect) throw new Error("Publish map form is missing an element");
    const title = mapTitleInput.value;
    const description = mapDescriptionInput.value;
    const collectionId = parseInt(collectionSelect.value);
    const payload: CreateMapRequestPayload = {
      settings: settings,
      title: title,
      description: description,
      collectionId: collectionId,
    };
    const payloadValidationCode = isValidCreateMapRequestPayload(payload);
    switch (payloadValidationCode) {
      case CreateMapRequestValidationCode.InvalidCollection: {
        collectionSelect.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.InvalidDescription: {
        mapDescriptionInput.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.InvalidSettings: {
        console.log("Publish map: Invalid settings");
        break;
      }
      case CreateMapRequestValidationCode.InvalidTitle: {
        mapTitleInput.classList.add("is-invalid");
        break;
      }
      case CreateMapRequestValidationCode.Ok: {
        collectionSelect.classList.remove("is-invalid");
        mapDescriptionInput.classList.remove("is-invalid");
        mapTitleInput.classList.remove("is-invalid");
        sendAndHandleCreateMapRequest(payload);
      }
    }
  };
  update() {
    const settings = this.#generator.settings;
    const encodedSettings = encodeJsonSettings(settings);
    for (const key in inputs) {
      const inputsKey = key as keyof typeof inputs;
      const input = inputs[inputsKey];
      const settingsKey = key as keyof Settings;
      const value = settings[settingsKey];
      if (typeof value === "boolean") input.checked = value;
      else input.value = String(value);
      input.classList.remove("is-invalid");
    }
    dayInput.value = settings.day;
    mapSettingsInput.value = encodedSettings;
    mapSettingsInput.classList.remove("is-invalid");
    inputs.autoRefresh.checked = this.#generator.autoRefresh;
    this.disabled = true;
    dayInput.disabled = true;
    if (this.#generator.settings.world > 0) {
      worldSelect.value = String(this.#generator.settings.world);
      dayInput.disabled = false;
      if (this.#generator.settings.day !== "") {
        this.disabled = false;
        if (inputs.trim.checked) inputs.outputWidth.disabled = true;
        if (!inputs.drawBorders.checked) inputs.borderColor.disabled = true;
        if (!inputs.drawLegend.checked) inputs.legendFontSize.disabled = true;
        if (inputs.autoRefresh.checked && generateButton) generateButton.disabled = true;
        if (publishMapButton) {
          publishMapButton.disabled = false;
          publishMapButton.innerHTML = translation.addToCollection;
          publishMapButton.classList.remove("success", "danger");
        }
      }
    }
    for (let setting in settingsLimits.min) {
      inputs[setting].setAttribute("placeholder", String(settingsLimits.min[setting]) + "-");
      inputs[setting].setAttribute("min", String(settingsLimits.min[setting]));
    }
    for (let setting in settingsLimits.max) {
      const currentPlaceholder = inputs[setting].getAttribute("placeholder");
      inputs[setting].setAttribute("placeholder", currentPlaceholder + String(settingsLimits.max[setting]));
      inputs[setting].setAttribute("max", String(settingsLimits.max[setting]));
    }
    if (collectionSelect) {
      const collectionOptions = collectionSelect.querySelectorAll("option");
      collectionOptions.forEach((option) => {
        const collectionId = parseInt(option.value);
        const collectionWorldId = parseInt(option.dataset.worldId ?? "");
        if (collectionId > 0) {
          if (!isValidId(collectionWorldId)) throw new Error("Invalid data-world-id property: ");
          const isMatchingWorldId = collectionWorldId === this.#generator.settings.world;
          option.disabled = !isMatchingWorldId;
        }
      });
    }
  }
}

export default SettingsTab;
