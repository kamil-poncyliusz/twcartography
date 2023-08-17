import { handleDeleteCollection } from "../../routes/api-handlers.js";
import "./navbar.js";
import { postRequest } from "./requests.js";
import { selectInputValue } from "./utils.js";
import { isValidCollectionDescription, isValidFrameDelay, isValidID, isValidMapDescription, isValidTitle } from "./validators.js";

const mapTiles = document.querySelectorAll("#tiles .map-tile");
const animationTiles = document.querySelectorAll("#tiles .animation-tile");
const displayedMap = document.getElementById("displayed-map");
const displayedMapImage = document.querySelector("#image-wrapper > img");
const closeMapButton = document.getElementById("close-map");
const previousMapButton = document.getElementById("previous-map");
const nextMapButton = document.getElementById("next-map");
const collectionTitle = document.getElementById("collection-title") as HTMLInputElement | null;
const collectionDescription = document.getElementById("collection-description") as HTMLTextAreaElement | null;
const deleteCollectionButton = document.getElementById("delete-collection");
const mapInfo = document.getElementById("map-info");
const mapTitle = document.getElementById("map-title") as HTMLInputElement | null;
const mapDescription = document.getElementById("map-description") as HTMLTextAreaElement | null;
const deleteMapButton = document.getElementById("delete-map") as HTMLButtonElement | null;
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement | null;
const animationSettings = document.getElementById("animation-settings");
const animationCreatorModeCheckbox = document.getElementById("animation-creator-mode") as HTMLInputElement | null;
const checkAllMapsButton = document.getElementById("check-all-maps") as HTMLButtonElement | null;
const uncheckAllMapsButton = document.getElementById("uncheck-all-maps") as HTMLButtonElement | null;
const frameDelayInput = document.getElementById("frame-delay") as HTMLInputElement | null;
const createAnimationButton = document.getElementById("create-animation") as HTMLButtonElement | null;

let currentlyDisplayedMap: HTMLDivElement | null = null;

const textAreaAutoResize = function (e: Event) {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = target.scrollHeight < 5 ? "2rem" : `${target.scrollHeight}px`;
};

const isAnyTextFieldFocused = function () {
  const activeElementTagName = document.activeElement?.tagName.toLowerCase();
  if (activeElementTagName === "input" || activeElementTagName === "textarea") return true;
  return false;
};

const displayMap = function () {
  if (!currentlyDisplayedMap) return;
  const id = parseInt(currentlyDisplayedMap.dataset.id ?? "0");
  const title = currentlyDisplayedMap.dataset.title;
  const description = currentlyDisplayedMap.dataset.description;
  if (isNaN(id)) return;
  const src = typeof title === "string" && typeof description === "string" ? `/images/maps/${id}.png` : `/images/animations/${id}.gif`;
  if (displayedMapImage) displayedMapImage.setAttribute("src", src);
  if (displayedMap) displayedMap.style.visibility = "visible";
  updateMapInfo();
};

const closeMap = function () {
  if (displayedMap) displayedMap.style.visibility = "hidden";
  currentlyDisplayedMap = null;
  updateMapInfo();
};

const viewNextMap = function () {
  if (!currentlyDisplayedMap) return;
  if (isAnyTextFieldFocused()) return;
  const nextSibling = currentlyDisplayedMap.nextElementSibling as HTMLDivElement | null;
  if (nextSibling) currentlyDisplayedMap = nextSibling;
  else {
    const tilesContainer = currentlyDisplayedMap.parentElement as HTMLDivElement;
    currentlyDisplayedMap = tilesContainer.lastElementChild as HTMLDivElement;
  }
  displayMap();
};

const viewPreviousMap = function () {
  if (!currentlyDisplayedMap) return;
  if (isAnyTextFieldFocused()) return;
  const previousSibling = currentlyDisplayedMap.previousElementSibling as HTMLDivElement | null;
  if (previousSibling) currentlyDisplayedMap = previousSibling;
  else {
    const tilesContainer = currentlyDisplayedMap.parentElement as HTMLDivElement;
    currentlyDisplayedMap = tilesContainer.firstElementChild as HTMLDivElement;
  }
  displayMap();
};

const updateMapInfo = function () {
  if (!mapInfo || !mapTitle || !mapDescription || !encodedSettingsInput) return;
  const title = currentlyDisplayedMap?.dataset.title ?? "";
  const description = currentlyDisplayedMap?.dataset.description ?? "";
  const encodedSettings = currentlyDisplayedMap?.dataset.encodedSettings ?? "";
  mapTitle.value = title;
  mapDescription.textContent = description;
  encodedSettingsInput.value = encodedSettings;
  if (currentlyDisplayedMap) {
    if (currentlyDisplayedMap.classList.contains("map-tile")) {
      mapTitle.classList.remove("hidden");
      mapDescription.classList.remove("hidden");
      encodedSettingsInput.classList.remove("hidden");
      mapDescription.dispatchEvent(new Event("input"));
    } else {
      mapTitle.classList.add("hidden");
      mapDescription.classList.add("hidden");
      encodedSettingsInput.classList.add("hidden");
    }
    mapInfo.classList.remove("hidden");
    animationSettings?.classList.add("hidden");
  } else {
    mapInfo.classList.add("hidden");
    animationSettings?.classList.remove("hidden");
  }
};

const handleTileClick = function (e: Event) {
  let tile = e.target as HTMLDivElement;
  if (tile.tagName === "IMG") tile = tile.closest("div[data-id]") as HTMLDivElement;
  if (!tile) return console.log("Clicked element is not a valid tile");
  // if (!tile || !tile.dataset.id || !tile.dataset.title || typeof tile.dataset.description !== "string") return;
  const animationCreatorMode = animationCreatorModeCheckbox !== null && animationCreatorModeCheckbox.checked;
  if (!animationCreatorMode) currentlyDisplayedMap = tile;
  else if (tile.classList.contains("map-tile")) {
    if (tile.dataset.checked !== "checked") tile.dataset.checked = "checked";
    else tile.dataset.checked = "";
  }
  displayMap();
};

const useKeyboardShortcut = function (e: KeyboardEvent) {
  const keyCode = e.code;
  switch (keyCode) {
    case "ArrowLeft": {
      viewPreviousMap();
      break;
    }
    case "ArrowRight": {
      viewNextMap();
      break;
    }
    case "Escape": {
      closeMap();
      break;
    }
  }
};

const deleteCollection = async function () {
  const id = parseInt(window.location.pathname.split("/")[2]);
  if (!isValidID(id)) return;
  const payload = {
    id: id,
  };
  const isDeleted: Awaited<ReturnType<typeof handleDeleteCollection>> = await postRequest("/api/collection/delete", payload);
  if (isDeleted) window.location.href = "/";
  else console.log("Failed to delete this collection");
};

const deleteMap = async function () {
  if (!currentlyDisplayedMap) return;
  const id = parseInt(currentlyDisplayedMap.dataset.id ?? "");
  if (!isValidID(id)) return;
  const payload = {
    id: id,
  };
  const url = currentlyDisplayedMap.classList.contains("map-tile") ? "/api/map/delete" : "/api/animation/delete";
  const isDeleted = await postRequest(url, payload);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete this map");
};

const editCollectionTitle = async function (e: Event) {
  const target = e.target as HTMLInputElement;
  const collectionID = parseInt(window.location.pathname.split("/")[2]);
  if (!isValidID(collectionID)) return;
  const newTitle = target.value;
  if (!isValidTitle(newTitle)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/collection/update", { id: collectionID, title: newTitle });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editCollectionDescription = async function (e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const collectionID = parseInt(window.location.pathname.split("/")[2]);
  if (!isValidID(collectionID)) return;
  const newDescription = target.value;
  if (!isValidCollectionDescription(newDescription)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/collection/update", { id: collectionID, description: newDescription });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editMapTitle = async function (e: Event) {
  if (!currentlyDisplayedMap) return;
  const target = e.target as HTMLInputElement;
  const mapID = parseInt(currentlyDisplayedMap.dataset.id ?? "");
  if (!isValidID(mapID)) return;
  const newTitle = target.value;
  if (!isValidTitle(newTitle)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/map/update", { id: mapID, title: newTitle });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editMapDescription = async function (e: Event) {
  if (!currentlyDisplayedMap) return;
  const target = e.target as HTMLTextAreaElement;
  const mapID = parseInt(currentlyDisplayedMap.dataset.id ?? "");
  if (!isValidID(mapID)) return;
  const newDescription = target.value;
  if (!isValidMapDescription(newDescription)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/map/update", { id: mapID, description: newDescription });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const toggleCreateAnimationMode = function (e: Event) {
  if (!checkAllMapsButton || !uncheckAllMapsButton || !frameDelayInput || !createAnimationButton) return;
  const target = e.target as HTMLInputElement;
  const animationCreatorMode = target.checked;
  if (animationCreatorMode) {
    checkAllMapsButton.disabled = false;
    uncheckAllMapsButton.disabled = false;
    frameDelayInput.disabled = false;
    createAnimationButton.disabled = false;
  } else {
    checkAllMapsButton.disabled = true;
    uncheckAllMapsButton.disabled = true;
    frameDelayInput.disabled = true;
    createAnimationButton.disabled = true;
    checkAllMaps();
  }
};

const checkAllMaps = function () {
  mapTiles.forEach((element) => {
    const mapTile = element as HTMLDivElement;
    mapTile.dataset.checked = "checked";
  });
};

const uncheckAllMaps = function () {
  mapTiles.forEach((element) => {
    const mapTile = element as HTMLDivElement;
    mapTile.dataset.checked = "";
  });
};

const createAnimation = async function () {
  const frameDelay = parseInt(frameDelayInput?.value ?? "");
  if (!isValidFrameDelay(frameDelay)) return;
  const frames: number[] = [];
  mapTiles.forEach((element) => {
    const mapTile = element as HTMLDivElement;
    const mapID = parseInt(mapTile.dataset.id ?? "");
    if (mapTile.dataset.checked === "checked" && isValidID(mapID)) frames.push(mapID);
  });
  const collectionID = parseInt(window.location.pathname.split("/")[2]);
  if (!isValidID(collectionID)) return;
  const payload = {
    collectionId: collectionID,
    frames: frames,
    frameDelay: frameDelay,
  };
  const isAnimationCreated = await postRequest("/api/animation/create", payload);
};

mapTiles.forEach((tile) => {
  tile.addEventListener("click", handleTileClick);
});
animationTiles.forEach((tile) => {
  tile.addEventListener("click", handleTileClick);
});
if (closeMapButton) closeMapButton.addEventListener("click", closeMap);
if (nextMapButton) nextMapButton.addEventListener("click", viewNextMap);
if (previousMapButton) previousMapButton.addEventListener("click", viewPreviousMap);
if (collectionTitle) collectionTitle.addEventListener("change", editCollectionTitle);
if (collectionDescription) {
  collectionDescription.addEventListener("change", editCollectionDescription);
  collectionDescription.addEventListener("input", textAreaAutoResize);
}
if (mapTitle) mapTitle.addEventListener("change", editMapTitle);
if (mapDescription) {
  mapDescription.addEventListener("change", editMapDescription);
  mapDescription.addEventListener("input", textAreaAutoResize);
}
if (deleteCollectionButton) deleteCollectionButton.addEventListener("click", deleteCollection);
if (deleteMapButton) deleteMapButton.addEventListener("click", deleteMap);
if (encodedSettingsInput) encodedSettingsInput.addEventListener("click", selectInputValue);
if (animationSettings) {
  animationCreatorModeCheckbox?.addEventListener("change", toggleCreateAnimationMode);
  checkAllMapsButton?.addEventListener("click", checkAllMaps);
  uncheckAllMapsButton?.addEventListener("click", uncheckAllMaps);
  createAnimationButton?.addEventListener("click", createAnimation);
}
document.body.addEventListener("keydown", useKeyboardShortcut);

updateMapInfo();
if (collectionDescription) collectionDescription.dispatchEvent(new Event("input"));
