import "./navBar.js";
import MapLoader from "./MapLoader.js";
import { MapLoaderSettings } from "./Types.js";

const radios = document.querySelectorAll("#accessories input[type='radio']");
const worldSelect = document.getElementById("world-select") as HTMLSelectElement;

const getFilterValues = function () {
  const result: MapLoaderSettings = {
    author: 0,
    order: "newest",
    timespan: "any",
    world: 0,
  };
  if (worldSelect.value != "") result.world = parseInt(worldSelect.value);
  const checkedTimespan: HTMLInputElement | null = document.querySelector("input[name='timespan']:checked");
  if (checkedTimespan) result.timespan = checkedTimespan.value;
  const checkedOrder: HTMLInputElement | null = document.querySelector("input[name='order']:checked");
  if (checkedOrder) result.order = checkedOrder.value;
  result.author = 0;
  return result;
};

const updateFilters = function () {
  const settings = getFilterValues();
  mapLoader.update(settings);
};

const mapLoader = new MapLoader(getFilterValues());

radios.forEach((radio) => {
  radio.addEventListener("change", updateFilters);
});
worldSelect.addEventListener("change", updateFilters);
