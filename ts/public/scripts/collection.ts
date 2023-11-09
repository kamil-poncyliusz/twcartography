import "./navbar.js";
import { handleDeleteCollection } from "../../routes/api/collection-handlers.js";
import { postRequest } from "./requests.js";
import { selectInputValue } from "./generator-controller-helpers.js";
import { isValidCollectionDescription, isValidFrameDelay, isValidId, isValidMapDescription, isValidTitle } from "./validators.js";

const mapTiles = document.querySelectorAll("#tiles .map-tile") as NodeListOf<HTMLDivElement>;
const animationTiles = document.querySelectorAll("#tiles .animation-tile") as NodeListOf<HTMLDivElement>;
const displayedMap = document.getElementById("displayed-map") as HTMLDivElement;
const displayedMapImage = document.querySelector("#image-wrapper > img") as HTMLImageElement;
const closeMapButton = document.getElementById("close-map") as HTMLButtonElement;
const previousMapButton = document.getElementById("previous-map") as HTMLButtonElement;
const nextMapButton = document.getElementById("next-map") as HTMLButtonElement;
const collectionTitle = document.getElementById("collection-title") as HTMLInputElement;
const collectionDescription = document.getElementById("collection-description") as HTMLTextAreaElement;
const deleteCollectionButton = document.getElementById("delete-collection") as HTMLButtonElement | null;
const mapInfo = document.getElementById("map-info") as HTMLDivElement;
const mapTitle = document.getElementById("map-title") as HTMLInputElement;
const mapDescription = document.getElementById("map-description") as HTMLTextAreaElement;
const deleteMapButton = document.getElementById("delete-map") as HTMLButtonElement | null;
const mapSettingsInput = document.getElementById("map-settings") as HTMLInputElement;
const animationSettings = document.getElementById("animation-settings") as HTMLDivElement | null;
const animationCreatorModeCheckbox = document.getElementById("animation-creator-mode") as HTMLInputElement | null;
const checkAllFramesButton = document.getElementById("check-all-frames") as HTMLButtonElement | null;
const uncheckAllFramesButton = document.getElementById("uncheck-all-frames") as HTMLButtonElement | null;
const frameDelayInput = document.getElementById("frame-delay") as HTMLInputElement | null;
const createAnimationButton = document.getElementById("create-animation") as HTMLButtonElement | null;

let currentlyDisplayedMap: HTMLDivElement | null = null;

const getCollectionId = function (): number {
  const id = parseInt(window.location.pathname.split("/")[2]);
  if (!isValidId(id)) throw new Error("Cannot delete collection: Invalid collection Id");
  return id;
};

const getDisplayedMapId = function (): number {
  if (!currentlyDisplayedMap) throw new Error("Cannot get map Id: currentlyDisplayedMap is null");
  const mapId = parseInt(currentlyDisplayedMap.dataset.id ?? "");
  if (!isValidId(mapId)) throw new Error("Cannot edit map: Invalid collection Id");
  return mapId;
};

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
  if (!currentlyDisplayedMap) throw new Error("Cannot display map: currentlyDisplayedMap is null");
  const id = parseInt(currentlyDisplayedMap.dataset.id ?? "");
  const title = currentlyDisplayedMap.dataset.title;
  const description = currentlyDisplayedMap.dataset.description;
  if (isNaN(id)) throw new Error("Cannot display map: Invalid Map Id");
  const isAnimation = typeof title === "string" && typeof description === "string";
  const imageSrc = isAnimation ? `/images/maps/${id}.png` : `/images/animations/${id}.gif`;
  displayedMapImage.setAttribute("src", imageSrc);
  displayedMap.style.visibility = "visible";
  updateMapInfo();
};

const closeMap = function () {
  displayedMap.style.visibility = "hidden";
  currentlyDisplayedMap = null;
  updateMapInfo();
};

const viewNextMap = function () {
  if (isAnyTextFieldFocused()) return;
  if (!currentlyDisplayedMap) throw new Error("Cannot change current map: currentlyDisplayedMap is null");
  const nextSibling = currentlyDisplayedMap.nextElementSibling as HTMLDivElement | null;
  if (nextSibling) currentlyDisplayedMap = nextSibling;
  displayMap();
};

const viewPreviousMap = function () {
  if (isAnyTextFieldFocused()) return;
  if (!currentlyDisplayedMap) throw new Error("Cannot change current map: currentlyDisplayedMap is null");
  const previousSibling = currentlyDisplayedMap.previousElementSibling as HTMLDivElement | null;
  if (previousSibling) currentlyDisplayedMap = previousSibling;
  displayMap();
};

const updateMapInfo = function () {
  const title = currentlyDisplayedMap?.dataset.title ?? "";
  const description = currentlyDisplayedMap?.dataset.description ?? "";
  const mapSettingsString = currentlyDisplayedMap?.dataset.settings ?? "";
  mapTitle.value = title;
  mapDescription.textContent = description;
  mapSettingsInput.value = mapSettingsString;
  if (currentlyDisplayedMap) {
    const isAnimation = !currentlyDisplayedMap.classList.contains("map-tile");
    if (isAnimation) {
      mapTitle.classList.add("hidden");
      mapDescription.classList.add("hidden");
      mapSettingsInput.classList.add("hidden");
    } else {
      mapTitle.classList.remove("hidden");
      mapDescription.classList.remove("hidden");
      mapSettingsInput.classList.remove("hidden");
      mapDescription.dispatchEvent(new Event("input"));
    }
    mapInfo.classList.remove("hidden");
    animationSettings?.classList.add("hidden");
  } else {
    mapInfo.classList.add("hidden");
    animationSettings?.classList.remove("hidden");
  }
};

const handleTileClick = function (e: Event) {
  let tile = e.target as HTMLDivElement | null;
  if (tile?.tagName === "IMG") tile = tile.closest("div[data-id]") as HTMLDivElement | null;
  if (!tile) throw new Error("Clicked element is not a valid tile");
  const animationCreatorMode = animationCreatorModeCheckbox !== null && animationCreatorModeCheckbox.checked;
  const isTileAMap = tile.classList.contains("map-tile");
  if (!animationCreatorMode) {
    currentlyDisplayedMap = tile;
    displayMap();
    return;
  }
  if (!isTileAMap) return;
  if (tile.dataset.checked !== "checked") tile.dataset.checked = "checked";
  else tile.dataset.checked = "";
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
  const id = getCollectionId();
  const payload = {
    id: id,
  };
  const isDeletionConfirmed = confirm("Na pewno chcesz usunąć całą kolekcję?");
  if (!isDeletionConfirmed) return;
  const isDeleted: Awaited<ReturnType<typeof handleDeleteCollection>> = await postRequest("/api/collection/delete", payload);
  if (isDeleted) window.location.href = "/";
  else console.log("Failed to delete this collection");
};

const deleteMap = async function () {
  if (!currentlyDisplayedMap) throw new Error("Cannot get map Id: currentlyDisplayedMap is null");
  const id = getDisplayedMapId();
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
  const collectionId = getCollectionId();
  const newTitle = target.value;
  if (!isValidTitle(newTitle)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/collection/update", { id: collectionId, title: newTitle });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editCollectionDescription = async function (e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const collectionId = getCollectionId();
  const newDescription = target.value;
  if (!isValidCollectionDescription(newDescription)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/collection/update", { id: collectionId, description: newDescription });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editMapTitle = async function (e: Event) {
  const target = e.target as HTMLInputElement;
  const mapId = getDisplayedMapId();
  const newTitle = target.value;
  if (!isValidTitle(newTitle)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/map/update", { id: mapId, title: newTitle });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const editMapDescription = async function (e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const mapId = getDisplayedMapId();
  const newDescription = target.value;
  if (!isValidMapDescription(newDescription)) return target.classList.add("is-invalid");
  const isUpdated = await postRequest("/api/map/update", { id: mapId, description: newDescription });
  if (isUpdated) target.classList.remove("is-invalid");
  else target.classList.add("is-invalid");
};

const toggleCreateAnimationMode = function (e: Event) {
  if (!checkAllFramesButton || !uncheckAllFramesButton || !frameDelayInput || !createAnimationButton)
    throw new Error("Animation creator interface element is null");
  const target = e.target as HTMLInputElement;
  const animationCreatorMode = target.checked;
  if (animationCreatorMode) {
    checkAllFramesButton.disabled = false;
    uncheckAllFramesButton.disabled = false;
    frameDelayInput.disabled = false;
    createAnimationButton.disabled = false;
  } else {
    checkAllFramesButton.disabled = true;
    uncheckAllFramesButton.disabled = true;
    frameDelayInput.disabled = true;
    createAnimationButton.disabled = true;
    checkAllFrames();
  }
};

const checkAllFrames = function () {
  mapTiles.forEach((element) => {
    const mapTile = element;
    mapTile.dataset.checked = "checked";
  });
};

const uncheckAllFrames = function () {
  mapTiles.forEach((element) => {
    const mapTile = element;
    mapTile.dataset.checked = "";
  });
};

const createAnimation = async function () {
  if (!frameDelayInput) throw new Error("Animation creator interface element is missing");
  const frameDelay = parseInt(frameDelayInput.value ?? "");
  if (!isValidFrameDelay(frameDelay)) return frameDelayInput.classList.add("is-invalid");
  else frameDelayInput.classList.remove("is-invalid");
  const frames: number[] = [];
  mapTiles.forEach((element) => {
    const mapTile = element;
    const mapId = parseInt(mapTile.dataset.id ?? "");
    if (mapTile.dataset.checked === "checked" && isValidId(mapId)) frames.push(mapId);
  });
  const collectionId = getCollectionId();
  if (frames.length === 0) return console.log("No selected frames found");
  const payload = {
    collectionId: collectionId,
    frames: frames,
    frameDelay: frameDelay,
  };
  const isAnimationCreated = await postRequest("/api/animation/create", payload);
  if (isAnimationCreated) window.location.reload();
  else console.log("Failed to create an animation");
};

mapTiles.forEach((tile) => {
  tile.addEventListener("click", handleTileClick);
});
animationTiles.forEach((tile) => {
  tile.addEventListener("click", handleTileClick);
});
closeMapButton?.addEventListener("click", closeMap);
nextMapButton?.addEventListener("click", viewNextMap);
previousMapButton?.addEventListener("click", viewPreviousMap);
collectionTitle?.addEventListener("change", editCollectionTitle);
collectionDescription?.addEventListener("change", editCollectionDescription);
collectionDescription?.addEventListener("input", textAreaAutoResize);
mapTitle?.addEventListener("change", editMapTitle);
mapDescription?.addEventListener("change", editMapDescription);
mapDescription?.addEventListener("input", textAreaAutoResize);
deleteCollectionButton?.addEventListener("click", deleteCollection);
deleteMapButton?.addEventListener("click", deleteMap);
mapSettingsInput?.addEventListener("click", selectInputValue);
if (animationSettings) {
  animationCreatorModeCheckbox?.addEventListener("change", toggleCreateAnimationMode);
  checkAllFramesButton?.addEventListener("click", checkAllFrames);
  uncheckAllFramesButton?.addEventListener("click", uncheckAllFrames);
  createAnimationButton?.addEventListener("click", createAnimation);
}
document.body.addEventListener("keydown", useKeyboardShortcut);

updateMapInfo();
if (collectionDescription) collectionDescription.dispatchEvent(new Event("input"));
