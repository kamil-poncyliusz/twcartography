import CollectionLoader from "./class/CollectionLoader.js";
import "./navbar.js";

const collectionContainer = document.getElementById("collection-list") as HTMLDivElement;

const collectionLoader = new CollectionLoader(collectionContainer);

document.addEventListener("scroll", (e) => {
  if (document.documentElement.clientHeight + document.documentElement.scrollTop > document.documentElement.scrollHeight - 50)
    collectionLoader.loadPage();
});

document.dispatchEvent(new Event("scroll"));
