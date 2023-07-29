import { handleDeleteCollection } from "../../routes/api-handlers.js";
import "./navbar.js";
import { postRequest } from "./requests.js";
import { selectInputValue } from "./utils.js";
import { isValidCollectionDescription, isValidID, isValidMapDescription, isValidTitle } from "./validators.js";

const mapTiles = document.querySelectorAll("#map-tiles > .map-tile");
const displayedMap = document.getElementById("displayed-map");
const displayedMapImage = document.querySelector("#image-wrapper > img");
const closeMapButton = document.getElementById("close-map");
const previousMapButton = document.getElementById("previous-map");
const nextMapButton = document.getElementById("next-map");
const collectionTitle = document.getElementById("collection-title") as HTMLInputElement | null;
const collectionDescription = document.getElementById("collection-description") as HTMLTextAreaElement | null;
const deleteCollectionButton = document.getElementById("delete-collection");
const mapTitle = document.getElementById("map-title") as HTMLInputElement | null;
const mapDescription = document.getElementById("map-description") as HTMLTextAreaElement | null;
const deleteMapButton = document.getElementById("delete-map") as HTMLButtonElement | null;
const encodedSettingsInput = document.getElementById("encoded-settings") as HTMLInputElement | null;

let currentlyDisplayedMap: HTMLDivElement | null = null;

const textAreaAutoResize = function (e: Event) {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight + 5}px`;
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
  if (isNaN(id) || !title || !description) return;
  const src = `/images/maps/${id}.png`;
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
  else currentlyDisplayedMap = mapTiles[mapTiles.length - 1] as HTMLDivElement;
  displayMap();
};

const viewPreviousMap = function () {
  if (!currentlyDisplayedMap) return;
  if (isAnyTextFieldFocused()) return;
  const previousSibling = currentlyDisplayedMap.previousElementSibling as HTMLDivElement | null;
  if (previousSibling) currentlyDisplayedMap = previousSibling;
  else currentlyDisplayedMap = mapTiles[0] as HTMLDivElement;
  displayMap();
};

const updateMapInfo = function () {
  if (!mapTitle || !mapDescription || !encodedSettingsInput) return;
  const title = currentlyDisplayedMap?.dataset.title ?? "";
  const description = currentlyDisplayedMap?.dataset.description ?? "";
  const encodedSettings = currentlyDisplayedMap?.dataset.encodedSettings ?? "";
  mapTitle.value = title;
  mapDescription.textContent = description;
  encodedSettingsInput.value = encodedSettings;
  if (currentlyDisplayedMap) {
    mapTitle.classList.remove("hidden");
    mapDescription.classList.remove("hidden");
    deleteMapButton?.classList.remove("hidden");
    encodedSettingsInput.classList.remove("hidden");
    mapDescription.dispatchEvent(new Event("input"));
  } else {
    mapTitle.classList.add("hidden");
    mapDescription.classList.add("hidden");
    deleteMapButton?.classList.add("hidden");
    encodedSettingsInput.classList.add("hidden");
  }
};

const handleMapTileClick = function (e: Event) {
  let newEnlargedMap = e.target as HTMLDivElement;
  if (newEnlargedMap.tagName === "IMG") newEnlargedMap = newEnlargedMap.closest("div[data-id]") as HTMLDivElement;
  if (!newEnlargedMap || !newEnlargedMap.dataset.id || !newEnlargedMap.dataset.title || !newEnlargedMap.dataset.description) return;
  currentlyDisplayedMap = newEnlargedMap;
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
  const isDeleted = await postRequest("/api/map/delete", payload);
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

mapTiles.forEach((mapTile) => {
  mapTile.addEventListener("click", handleMapTileClick);
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
document.body.addEventListener("keydown", useKeyboardShortcut);

updateMapInfo();
if (collectionDescription) collectionDescription.dispatchEvent(new Event("input"));
