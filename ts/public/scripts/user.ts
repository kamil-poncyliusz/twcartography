import "./navbar.js";
import CollectionLoader from "./class/collection-loader.js";
import { isValidId } from "./validators.js";

const collectionContainer = document.getElementById("collection-list") as HTMLDivElement;

const collectionLoader = new CollectionLoader(collectionContainer);

const userId = parseInt(window.location.pathname.split("/")[2]);
if (isValidId(userId)) collectionLoader.authorId = userId;
else throw new Error("Invalid user id");

document.addEventListener("scroll", (e) => {
  if (document.documentElement.clientHeight + document.documentElement.scrollTop > document.documentElement.scrollHeight * 0.9)
    collectionLoader.loadPage();
});
