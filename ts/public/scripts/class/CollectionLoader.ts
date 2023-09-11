import { handleReadCollections } from "../../../routes/api-handlers";
import { CollectionWithRelations } from "../../../src/Types";
import { postRequest } from "../requests.js";

class CollectionLoader {
  #containerElement: HTMLDivElement;
  #endOfData: boolean = false;
  #fetching: boolean = false;
  #nextPage: number = 1;
  constructor(containerElement: HTMLDivElement) {
    this.#containerElement = containerElement;
  }
  #append(collection: CollectionWithRelations) {
    const createdAt = new Date(collection.createdAt).toLocaleDateString();
    const newNode = document.createElement("div");
    newNode.classList.add("collection-card");
    let content = `<h1>${collection.title}</h1>`;
    content += `<p>Stworzona przez ${collection.author.login} ${createdAt}</p>`;
    content = `<a href="/collection/${collection.id}"><div><img src="/images/maps/${collection.maps[0].id}.png" alt="img"></div><div>${content}</div></a>`;
    newNode.innerHTML = content;
    this.#containerElement.appendChild(newNode);
  }
  async #fetch() {
    if (this.#fetching || this.#endOfData) return;
    this.#fetching = true;
    const url = `/api/collections`;
    const collections: Awaited<ReturnType<typeof handleReadCollections>> = await postRequest(url, { page: this.#nextPage });
    if (!collections || collections.length === 0) return (this.#endOfData = true);
    for (const collection of collections) {
      this.#append(collection);
    }
    this.#nextPage++;
    this.#fetching = false;
  }
  loadPage = () => {
    this.#fetch();
  };
}

export default CollectionLoader;
