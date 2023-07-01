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
  if (!currentEnlargedMap) return;
  const title = currentEnlargedMap.dataset.title;
  const description = currentEnlargedMap.dataset.description;
  if (!title || !description || !mapTitle || !mapDescription) return;
  mapTitle.innerHTML = title;
  mapDescription.innerHTML = description;
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

mapTiles.forEach((mapTile) => {
  mapTile.addEventListener("click", handleMapTileClick);
});
if (hideEnlargedMapButton) hideEnlargedMapButton.addEventListener("click", hideEnlargedMap);
if (nextMapButton) nextMapButton.addEventListener("click", viewNextMap);
if (previousMapButton) previousMapButton.addEventListener("click", viewPreviousMap);
if (deleteCollectionButton) deleteCollectionButton.addEventListener("click", sendDeleteCollectionRequest);
document.body.addEventListener("keydown", useKeyboardShortcut);
