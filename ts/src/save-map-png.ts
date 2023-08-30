import fs from "fs/promises";
import { PNG } from "pngjs";

const mapsPath = `public/images/maps`;

const saveMapPng = async function (id: number, imageData: ImageData) {
  try {
    await fs.access(mapsPath);
  } catch {
    await fs.mkdir(mapsPath, { recursive: true });
  }
  const filePath = `${mapsPath}/${id}.png`;
  const pngImage = new PNG({ width: imageData.width, height: imageData.height });
  pngImage.data = Buffer.from(imageData.data);
  const fileHandle = await fs.open(filePath, "w");
  const writeStream = fileHandle.createWriteStream();
  writeStream.on("close", () => {
    fileHandle.close();
  });
  pngImage.pack().pipe(writeStream);
};

export default saveMapPng;
