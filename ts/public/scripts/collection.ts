import { handleDeleteCollection } from "../../routes/api-handlers.js";
import "./nav-bar.js";
import { postRequest } from "./requests.js";

const mapTiles = document.querySelectorAll("#map-tiles > .map-tile");
const enlargedMap = document.getElementById("map-enlarged");
const enlargedMapImage = document.querySelector("#image-wrapper > img");
const hideEnlargedMapButton = document.getElementById("hide-enlarged-map");
const previousMapButton = document.getElementById("previous-map");
const nextMapButton = document.getElementById("next-map");
const mapTitle = document.getElementById("map-title");
const mapDescription = document.getElementById("map-description");
const deleteCollectionButton = document.getElementById("delete-collection");
const deleteMapButton = document.getElementById("delete-map");
const collectionTitle = document.getElementById("collection-title");
const collectionDescription = document.getElementById("collection-description");
const editCollectionTitleButton = document.getElementById("edit-collection-title");
const editCollectionDescriptionButton = document.getElementById("edit-collection-description");
const collectionTitleEditInput = document.getElementById("collection-title-edit-input") as HTMLInputElement | undefined;
const collectionDescriptionEditTextarea = document.getElementById("collection-description-edit-textarea") as HTMLTextAreaElement | undefined;

let currentEnlargedMap: HTMLDivElement | null = null;
const mapImagesPath = "/images/maps";

const viewEnlargedMap = function () {
  if (!currentEnlargedMap) return;
  const id = parseInt(currentEnlargedMap.dataset.id ?? "0");
  const title = currentEnlargedMap.dataset.title;
  const description = currentEnlargedMap.dataset.description;
  if (isNaN(id) || !title || !description) return;
  const src = `${mapImagesPath}/${id}.png`;
  if (enlargedMapImage) enlargedMapImage.setAttribute("src", src);
  if (enlargedMap) enlargedMap.style.visibility = "visible";
  updateMapInfo();
};

const hideEnlargedMap = function () {
  if (enlargedMap) enlargedMap.style.visibility = "hidden";
  currentEnlargedMap = null;
  updateMapInfo();
};

const viewNextMap = function () {
  if (!currentEnlargedMap) return;
  const nextSibling = currentEnlargedMap.nextElementSibling as HTMLDivElement | null;
  if (nextSibling) currentEnlargedMap = nextSibling;
  else currentEnlargedMap = mapTiles[mapTiles.length - 1] as HTMLDivElement;
  viewEnlargedMap();
};

const viewPreviousMap = function () {
  if (!currentEnlargedMap) return;
  const previousSibling = currentEnlargedMap.previousElementSibling as HTMLDivElement | null;
  if (previousSibling) currentEnlargedMap = previousSibling;
  else currentEnlargedMap = mapTiles[0] as HTMLDivElement;
  viewEnlargedMap();
};

const updateMapInfo = function () {
  let title = "...";
  let description = "...";
  if (currentEnlargedMap) {
    title = currentEnlargedMap.dataset.title ?? "...";
    description = currentEnlargedMap.dataset.description ?? "...";
  }
  if (!mapTitle || !mapDescription) return;
  mapTitle.innerHTML = title;
  mapDescription.innerHTML = description;
  if (!deleteMapButton) return;
  if (currentEnlargedMap) deleteMapButton.classList.remove("hidden");
  else deleteMapButton.classList.add("hidden");
};

const handleMapTileClick = function (e: Event) {
  let target = e.target as HTMLDivElement;
  if (target.tagName === "IMG") target = target.closest("div[data-id]") as HTMLDivElement;
  if (!target || !target.dataset.id || !target.dataset.title || !target.dataset.description) return;
  currentEnlargedMap = target;
  viewEnlargedMap();
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
      hideEnlargedMap();
      break;
    }
  }
};

const sendDeleteCollectionRequest = async function () {
  const id = parseInt(window.location.pathname.split("/")[2]);
  if (isNaN(id) || id <= 0) return;
  const payload = {
    id: id,
  };
  const isDeleted: Awaited<ReturnType<typeof handleDeleteCollection>> = await postRequest("/api/collection/delete", payload);
  if (isDeleted) window.location.href = "/";
  else console.log("Failed to delete this collection");
};

const sendDeleteMapRequest = async function () {
  if (!currentEnlargedMap) return;
  const id = parseInt(currentEnlargedMap.dataset.id ?? "");
  if (isNaN(id) || id <= 0) return;
  const payload = {
    id: id,
  };
  const isDeleted = await postRequest("/api/map/delete", payload);
  if (isDeleted) window.location.reload();
  else console.log("Failed to delete this map");
};

const editCollectionTitle = async function () {
  if (!editCollectionTitleButton || !editCollectionTitleButton.dataset.editMode || !collectionTitle || !collectionTitleEditInput) return;
  const editMode: boolean = JSON.parse(editCollectionTitleButton.dataset.editMode);
  if (editMode) {
    const collectionID = parseInt(window.location.pathname.split("/")[2]);
    if (!(collectionID > 0)) return;
    const newTitle = collectionTitleEditInput.value;
    if (newTitle.length === 0 || newTitle.length > 15) {
      collectionTitleEditInput.classList.add("is-invalid");
      return;
    }
    const isUpdated = await postRequest("/api/collection/update", { id: collectionID, title: newTitle });
    if (!isUpdated) return;
    collectionTitle.innerHTML = newTitle;
    collectionTitle.classList.remove("hidden");
    collectionTitleEditInput.classList.add("hidden");
    collectionTitleEditInput.classList.remove("is-invalid");
    editCollectionTitleButton.innerHTML = "edytuj";
    editCollectionTitleButton.dataset.editMode = JSON.stringify(false);
  } else {
    const currentTitle = collectionTitle.textContent as string;
    collectionTitle.classList.add("hidden");
    collectionTitleEditInput.value = currentTitle;
    collectionTitleEditInput.classList.remove("hidden");
    editCollectionTitleButton.innerHTML = "zapisz";
    editCollectionTitleButton.dataset.editMode = JSON.stringify(true);
  }
};

const editCollectionDescription = async function () {
  if (
    !editCollectionDescriptionButton ||
    !editCollectionDescriptionButton.dataset.editMode ||
    !collectionDescription ||
    !collectionDescriptionEditTextarea
  )
    return;
  const editMode: boolean = JSON.parse(editCollectionDescriptionButton.dataset.editMode);
  if (editMode) {
    const collectionID = parseInt(window.location.pathname.split("/")[2]);
    if (!(collectionID > 0)) return;
    const newDescription = collectionDescriptionEditTextarea.value;
    if (newDescription.length > 500) {
      collectionDescriptionEditTextarea.classList.add("is-invalid");
      return;
    }
    const isUpdated = await postRequest("/api/collection/update", { id: collectionID, description: newDescription });
    if (!isUpdated) return;
    collectionDescription.innerHTML = newDescription;
    collectionDescription.classList.remove("hidden");
    collectionDescriptionEditTextarea.classList.add("hidden");
    collectionDescriptionEditTextarea.classList.remove("is-invalid");
    editCollectionDescriptionButton.innerHTML = "edytuj";
    editCollectionDescriptionButton.dataset.editMode = JSON.stringify(false);
  } else {
    const currentTitle = collectionDescription.textContent as string;
    collectionDescription.classList.add("hidden");
    collectionDescriptionEditTextarea.value = currentTitle;
    collectionDescriptionEditTextarea.classList.remove("hidden");
    editCollectionDescriptionButton.innerHTML = "zapisz";
    editCollectionDescriptionButton.dataset.editMode = JSON.stringify(true);
  }
};

mapTiles.forEach((mapTile) => {
  mapTile.addEventListener("click", handleMapTileClick);
});
if (hideEnlargedMapButton) hideEnlargedMapButton.addEventListener("click", hideEnlargedMap);
if (nextMapButton) nextMapButton.addEventListener("click", viewNextMap);
if (previousMapButton) previousMapButton.addEventListener("click", viewPreviousMap);
if (deleteCollectionButton) deleteCollectionButton.addEventListener("click", sendDeleteCollectionRequest);
if (deleteMapButton) deleteMapButton.addEventListener("click", sendDeleteMapRequest);
if (editCollectionTitleButton) editCollectionTitleButton.addEventListener("click", editCollectionTitle);
if (editCollectionDescriptionButton) editCollectionDescriptionButton.addEventListener("click", editCollectionDescription);
document.body.addEventListener("keydown", useKeyboardShortcut);
