import "./nav-bar.js";
import { handleDeleteMap } from "../../routes/api-handlers.js";
import { postRequest } from "./requests.js";
import { isValidID } from "./validators.js";

const settingsInput = document.getElementById("settings");
const deleteMapButton = document.getElementById("delete-map-button");

const deleteMap = async function () {
  const id = parseInt(window.location.pathname.split("/")[2] ?? "");
  if (!isValidID(id)) return;
  const isDeleted: Awaited<ReturnType<typeof handleDeleteMap>> = await postRequest("/api/map/delete", { id: id });
  if (isDeleted) window.location.href = `${window.location.origin}/maps`;
  else console.log("Failed to delete this map");
};

if (settingsInput)
  settingsInput.addEventListener("click", function (e: Event) {
    const target = e.target as HTMLInputElement;
    target.select();
  });

if (deleteMapButton) deleteMapButton.addEventListener("click", deleteMap);
