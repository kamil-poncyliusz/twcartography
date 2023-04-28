import "./navBar.js";

const settingsInput = document.getElementById("settings") as HTMLInputElement;
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

settingsInput.addEventListener("click", function (e: Event) {
  const target = e.target as HTMLInputElement;
  target.select();
});
