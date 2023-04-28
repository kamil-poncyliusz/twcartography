import "./navBar.js";
import MapLoader, { MapLoaderSettings } from "./MapLoader.js";

const mapLoaderSettings: MapLoaderSettings = {
  author: 0,
  order: "newest",
  timespan: "month",
  world: 0,
};

const mapLoader = new MapLoader(mapLoaderSettings);
