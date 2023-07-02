import { CreatedMapWithRelations, MapLoaderSettings } from "../../../src/Types.js";
import { handleReadMaps } from "../../../routes/api-handlers.js";
import { MAP_IMAGES_DIRECTORY } from "../constants.js";

const mapsList = document.getElementById("maps-list") as Element;

class MapLoader {
  #author: number = 0;
  #endOfData: boolean = true;
  #fetching: boolean = false;
  #order: string = "newest";
  #page: number = 0;
  #timespan: string = "any";
  #world: number = 0;
  constructor(settings: MapLoaderSettings) {
    this.update(settings).then(() => {
      document.addEventListener("scroll", this.#handleScroll);
    });
  }
  async #fetchMaps() {
    this.#page++;
    this.#fetching = true;
    const url = `${window.location.origin}/api/maps/${this.#world}/${this.#author}/${this.#timespan}/${this.#order}/${this.#page}`;
    const result = await fetch(url);
    const maps: Awaited<ReturnType<typeof handleReadMaps>> = await result.json();
    if (maps.length === 0) return (this.#endOfData = true);
    for (const map of maps) {
      this.#appendMap(map);
    }
    this.#fetching = false;
    return;
  }
  #appendMap(map: CreatedMapWithRelations) {
    if (map !== null) {
      const createdAt = new Date(map.createdAt).toLocaleDateString();
      const newNode = document.createElement("div");
      newNode.classList.add("map-card");
      let content = `<h1>${map.title}</h1>`;
      content += `<h2>${map.description}</h2>`;
      content += `<p>${map.turn} dzień świata ${map.world.server + map.world.num}</p>`;
      content += `<p>Stworzona przez ${map.author.login} ${createdAt}</p>`;
      content = `<a href="/map/${map.id}"><div><img src="${MAP_IMAGES_DIRECTORY}/${map.id}.png" alt="img"></div><div>${content}</div></a>`;
      newNode.innerHTML = content;
      mapsList.appendChild(newNode);
    }
  }
  #handleScroll = () => {
    if (this.#fetching || this.#endOfData) return;
    if (window.innerHeight + window.pageYOffset + 100 >= document.body.offsetHeight) {
      this.#fetchMaps();
    }
  };
  async update(settings: MapLoaderSettings) {
    mapsList.innerHTML = "";
    this.#endOfData = false;
    this.#fetching = false;
    this.#page = 0;
    this.#author = settings.author;
    this.#order = settings.order;
    this.#timespan = settings.timespan;
    this.#world = settings.world;
    await this.#fetchMaps();
  }
}

export default MapLoader;
