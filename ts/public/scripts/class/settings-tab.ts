import GeneratorController from "./generator-controller.js";
import { decodeSettings, encodeSettings } from "../settings-codec.js";
import { handleCreateMap } from "../../../routes/api/map-handlers.js";
import { postRequest } from "../requests.js";
import { isValidId, settingsLimits } from "../validators.js";
import { selectInputValue } from "../utils.js";
import { CreateMapRequestValidationCode, isValidCreateMapRequestPayload } from "../requests-validators.js";
import { CreateMapRequestPayload, CreateMapResponse, Settings } from "../../../src/types.js";

const inputs: { [key: string]: HTMLInputElement } = {
  autoRefresh: document.getElementById("auto-refresh") as HTMLInputElement,
  backgroundColor: document.getElementById("background-color") as HTMLInputElement,
  borderColor: document.getElementById("border-color") as HTMLInputElement,
  outputWidth: document.getElementById("output-width") as HTMLInputElement,
  scale: document.getElementById("scale") as HTMLInputElement,
  topSpotSize: document.getElementById("top-spot-size") as HTMLInputElement,
  trim: document.getElementById("trim") as HTMLInputElement,
  turn: document.getElementById("turn-input") as HTMLInputElement,
};
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement;
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
  publishMapButton.innerHTML = "oczekiwanie";
  const createMapResponse: Awaited<ReturnType<typeof handleCreateMap>> = await postRequest("/api/map/create", payload);
  if (!createMapResponse.success) {
    publishMapButton.innerHTML = "Wystąpił błąd";
    publishMapButton.classList.add("danger");
    return console.log("Failed to publish the map");
  }
  if (createMapResponse.newCollection) addNewCollectionOption(createMapResponse.newCollection);
  publishMapButton.innerHTML = "Dodałeś mapę do kolekcji";
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
    inputs.outputWidth.addEventListener("change", this.changeOutputWidth);
    inputs.scale.addEventListener("change", this.changeScale);
    inputs.topSpotSize.addEventListener("change", this.changeTopSpotSize);
    inputs.trim.addEventListener("input", this.changeTrim);
    inputs.turn.addEventListener("change", this.changeTurn);
    worldSelect.addEventListener("change", this.changeWorld);
    encodedSettingsInput.addEventListener("click", selectInputValue);
    encodedSettingsInput.addEventListener("input", this.changeEncodedSettings);
    encodedSettingsInput.dispatchEvent(new Event("input"));
    publishMapButton?.addEventListener("click", this.publishMap);
    window.addEventListener("beforeunload", (event) => {
      const isWorldSelected = Boolean(worldSelect.value);
      if (isWorldSelected) event.preventDefault();
    });
  }
  set disabled(value: boolean) {
    for (const key in inputs) {
      inputs[key].disabled = value;
    }
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
  changeEncodedSettings = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value;
    if (value === "") return input.classList.remove("is-invalid");
    const decodedSettings = decodeSettings(value);
    if (!decodedSettings || !(await this.#generator.applySettings(decodedSettings))) return input.classList.add("is-invalid");
    const worldIdString = String(this.#generator.world);
    worldSelect.value = worldIdString;
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
    const turn = parseInt(input.value);
    const isChanged = await this.#generator.changeTurn(turn);
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
    const encodedSettings = encodeSettings(settings);
    for (const key in inputs) {
      const inputsKey = key as keyof typeof inputs;
      const input = inputs[inputsKey];
      const settingsKey = key as keyof Settings;
      const value = settings[settingsKey];
      if (typeof value === "boolean") input.checked = value;
      else input.value = String(value);
      input.classList.remove("is-invalid");
    }
    encodedSettingsInput.value = encodedSettings;
    encodedSettingsInput.classList.remove("is-invalid");
    inputs.autoRefresh.checked = this.#generator.autoRefresh;
    if (this.#generator.world === 0) {
      this.disabled = true;
    } else if (this.#generator.turn === -1) {
      this.disabled = true;
      inputs.turn.disabled = false;
      inputs.turn.value = "";
    } else {
      this.disabled = false;
      if (inputs.trim.checked) inputs.outputWidth.disabled = true;
      if (inputs.autoRefresh.checked && generateButton) generateButton.disabled = true;
      if (publishMapButton) {
        publishMapButton.disabled = false;
        publishMapButton.innerHTML = "Dodaj do kolekcji";
        publishMapButton.classList.remove("success", "danger");
      }
    }
    const turnPlaceholder = this.#generator.latestTurn >= 0 ? `0-${this.#generator.latestTurn}` : "-";
    inputs.turn.setAttribute("placeholder", turnPlaceholder);
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
          const isMatchingWorldId = collectionWorldId === this.#generator.world;
          option.disabled = !isMatchingWorldId;
        }
      });
    }
  }
}

export default SettingsTab;
