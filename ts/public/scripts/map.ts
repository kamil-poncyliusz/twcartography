import { handleDeleteMap } from "../../routes/api-handlers.js";
import "./nav-bar.js";

const settingsInput = document.getElementById("settings");
const deleteMapButton = document.getElementById("delete-map-button");

const sendDeleteMapRequest = async function (mapId: number) {
  const url = `${window.location.origin}/api/map/delete`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: mapId,
    }),
  });
  const success: Awaited<ReturnType<typeof handleDeleteMap>> = await response.json();
  return success;
};

const deleteMap = async function () {
  const idString = window.location.pathname.split("/")[2];
  const id = parseInt(idString);
  if (typeof id !== "number" || isNaN(id) || id < 1) return;
  const isDeleted = await sendDeleteMapRequest(id);
  if (isDeleted) window.location.href = `${window.location.origin}/maps`;
  else console.log("Failed to delete this map");
};
// const image = document.querySelector("#map img") as HTMLImageElement;
// const wrapper = document.getElementById("wrapper") as HTMLDivElement;
// if (image) {
//   const canvas = document.createElement("canvas");
//   canvas.width = image.width;
//   canvas.height = image.height;
//   const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//   ctx.drawImage(image, 0, 0);
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const backgroundcolor = `rgb(${imageData.data[0]} ${imageData.data[1]} ${imageData.data[2]})`;
//   if (wrapper) wrapper.style.backgroundColor = backgroundcolor;
// }

if (settingsInput)
  settingsInput.addEventListener("click", function (e: Event) {
    const target = e.target as HTMLInputElement;
    target.select();
  });

if (deleteMapButton) deleteMapButton.addEventListener("click", deleteMap);
