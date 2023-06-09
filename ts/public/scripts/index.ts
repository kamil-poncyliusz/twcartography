import "./nav-bar.js";
import MapLoader from "./class/MapLoader.js";
import { MapLoaderSettings } from "../../src/Types.js";

const mapLoaderSettings: MapLoaderSettings = {
  author: 0,
  order: "newest",
  timespan: "month",
  world: 0,
};

const mapLoader = new MapLoader(mapLoaderSettings);
