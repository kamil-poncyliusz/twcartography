import { handleReadCollections } from "../../../routes/api/collection-handlers.js";
import { postRequest } from "../requests.js";
import { CollectionWithRelations, ReadCollectionsRequestPayload } from "../../../src/types";
import { getPreferredTranslation } from "../languages.js";

const acceptedLanguages = [...navigator.languages];
const translation = getPreferredTranslation(acceptedLanguages);

class CollectionLoader {
  #authorId: number = 0;
  #containerElement: HTMLDivElement;
  #endOfData: boolean = false;
  #isFetching: boolean = false;
  #nextPage: number = 1;
  #worldId: number = 0;
  constructor(containerElement: HTMLDivElement) {
    this.#containerElement = containerElement;
  }
  set authorId(authorId: number) {
    if (typeof authorId !== "number" || isNaN(authorId) || authorId < 0) throw new Error("Invalid authorId value");
    this.#authorId = authorId;
    this.clearResults();
    this.loadPage();
  }
  set worldId(worldId: number) {
    if (typeof worldId !== "number" || isNaN(worldId) || worldId < 0) throw new Error("Invalid worldId value");
    this.#worldId = worldId;
    this.clearResults();
    this.loadPage();
  }
  #append(collection: CollectionWithRelations) {
    const createdAt = new Date(collection.createdAt).toLocaleDateString();
    const newNode = document.createElement("div");
    newNode.classList.add("collection-card");
    let content = `<h1>${collection.title}</h1>`;
    content += `<p>${translation.world} ${collection.world.server + collection.world.num}</p>`;
    content += `<p>${translation.createdBy} ${collection.author.login} ${createdAt}</p>`;
    content = `<a href="/collection/${collection.id}"><div><img src="/images/maps/${collection.maps[0].id}.png" alt="img"></div><div>${content}</div></a>`;
    newNode.innerHTML = content;
    this.#containerElement.appendChild(newNode);
  }
  async #fetch() {
    if (this.#isFetching || this.#endOfData) return;
    this.#isFetching = true;
    const url = `/api/collection/read-many`;
    const payload: ReadCollectionsRequestPayload = {
      page: this.#nextPage,
      authorId: this.#authorId,
      worldId: this.#worldId,
    };
    const collections: Awaited<ReturnType<typeof handleReadCollections>> = await postRequest(url, payload);
    this.#isFetching = false;
    this.#nextPage++;
    if (!collections || collections.length === 0) return (this.#endOfData = true);
    for (const collection of collections) {
      this.#append(collection);
    }
  }
  loadPage() {
    this.#fetch();
  }
  clearResults() {
    this.#containerElement.innerHTML = "";
    this.#nextPage = 1;
    this.#endOfData = false;
  }
}

export default CollectionLoader;
