import fs from "fs";
import { PNG } from "pngjs";
import { MAP_IMAGES_DIRECTORY } from "../public/scripts/constants.js";

const mapsPath = `public${MAP_IMAGES_DIRECTORY}`;

const saveMapPng = async function (id: number, imageData: ImageData) {
  if (!fs.existsSync(mapsPath)) fs.mkdirSync(mapsPath);
  const path = `${mapsPath}/${id}.png`;
  const pngImage = new PNG({ width: imageData.width, height: imageData.height });
  pngImage.data = Buffer.from(imageData.data);
  const writeStream = fs.createWriteStream(path);
  pngImage.pack().pipe(writeStream);
  await writeStream.on("close", () => {
    return;
  });
  return true;
};

export default saveMapPng;
