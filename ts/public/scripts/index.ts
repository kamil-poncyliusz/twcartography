import "./navBar.js";
import MapLoader from "./MapLoader.js";
import { MapLoaderSettings } from "./Types.js";

const mapLoaderSettings: MapLoaderSettings = {
  author: 0,
  order: "newest",
  timespan: "month",
  world: 0,
};

const mapLoader = new MapLoader(mapLoaderSettings);
