import "./navBar.js";
import MapLoader, { MapLoaderSettings } from "./MapLoader.js";

const pathnameParts = window.location.pathname.split("/");
let userId = parseInt(pathnameParts[2]);
if (!(userId > 0)) userId = 0;

const mapLoaderSettings: MapLoaderSettings = {
  author: userId,
  order: "newest",
  timespan: "any",
  world: 0,
};

const mapLoader = new MapLoader(mapLoaderSettings);
