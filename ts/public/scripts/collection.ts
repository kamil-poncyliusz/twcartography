const mapTiles = document.querySelectorAll("#map-tiles > .map-tile");
const enlargedMap = document.getElementById("map-enlarged");
const enlargedMapImage = document.querySelector("#image-wrapper > img");
const hideEnlargedMapButton = document.getElementById("hide-enlarged-map");
const previousMapButton = document.getElementById("previous-map");
const nextMapButton = document.getElementById("next-map");

let currentEnlargedMap: HTMLDivElement | null = null;

const viewEnlargedMap = function () {
  if (!currentEnlargedMap) return;
  const id = parseInt(currentEnlargedMap.dataset.id ?? "0");
  const title = currentEnlargedMap.dataset.title;
  const description = currentEnlargedMap.dataset.description;
  if (isNaN(id) || !title || !description) return;
  const src = `../images/maps/${id}.png`;
  if (enlargedMapImage) enlargedMapImage.setAttribute("src", src);
  if (enlargedMap) enlargedMap.style.visibility = "visible";
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
const handleMapTileClick = function (e: Event) {
  let target = e.target as HTMLDivElement;
  if (target.tagName === "IMG") target = target.closest("div[data-id]") as HTMLDivElement;
  if (!target) return;
  const id = parseInt(target.dataset.id ?? "");
  const title = target.dataset.title;
  const description = target.dataset.description;
  if (!id || isNaN(id) || !title || !description) return;
  currentEnlargedMap = target;
  viewEnlargedMap();
};

mapTiles.forEach((mapTile) => {
  mapTile.addEventListener("click", handleMapTileClick);
});
if (hideEnlargedMapButton) hideEnlargedMapButton.addEventListener("click", hideEnlargedMap);
if (nextMapButton) nextMapButton.addEventListener("click", viewNextMap);
if (previousMapButton) previousMapButton.addEventListener("click", viewPreviousMap);
