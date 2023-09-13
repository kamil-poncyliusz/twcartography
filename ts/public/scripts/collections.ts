import CollectionLoader from "./class/CollectionLoader.js";
import "./navbar.js";

const collectionContainer = document.getElementById("collection-list") as HTMLDivElement;
const worldFilterSelect = document.getElementById("world-filter") as HTMLSelectElement;

const collectionLoader = new CollectionLoader(collectionContainer);
collectionLoader.loadPage();

document.addEventListener("scroll", (e) => {
  if (document.documentElement.clientHeight + document.documentElement.scrollTop > document.documentElement.scrollHeight * 0.9)
    collectionLoader.loadPage();
});
worldFilterSelect.addEventListener("change", (e) => {
  const newWorldId = parseInt(worldFilterSelect.value);
  collectionLoader.worldId = newWorldId;
});
