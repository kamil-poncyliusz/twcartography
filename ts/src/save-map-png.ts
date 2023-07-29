import fs from "fs";
import { PNG } from "pngjs";

const mapsPath = `public/images/maps`;

const saveMapPng = async function (id: number, imageData: ImageData) {
  if (!fs.existsSync(mapsPath)) fs.mkdirSync(mapsPath);
  const path = `${mapsPath}/${id}.png`;
  const pngImage = new PNG({ width: imageData.width, height: imageData.height });
  pngImage.data = Buffer.from(imageData.data);
  const writeStream = fs.createWriteStream(path);
  pngImage.pack().pipe(writeStream);
  writeStream.on("close", () => {
    return;
  });
};

export default saveMapPng;
