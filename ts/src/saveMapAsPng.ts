import fs from "fs";
import { PNG } from "pngjs";

const mapsPath = "public/images/maps";

const saveMapAsPng = async function (id: number, imageData: ImageData) {
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

export default saveMapAsPng;
