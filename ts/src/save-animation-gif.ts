import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import gifencoder from "gifencoder";

const saveCollectionGif = async function (animationId: number, frames: number[], frameDelay: number) {
  try {
    const firstFrame = await loadImage(`public/images/maps/${frames[0]}.png`);
    const width = firstFrame.width;
    const height = firstFrame.height;
    const encoder = new gifencoder(width, height);
    if (!fs.existsSync("public/images/animations")) fs.mkdirSync("public/images/animations");
    encoder.createReadStream().pipe(fs.createWriteStream(`public/images/animations/${animationId}.gif`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(frameDelay);
    encoder.setQuality(10);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    for (let frame of frames) {
      const image = await loadImage(`public/images/maps/${frame}.png`);
      ctx.drawImage(image, 0, 0);
      encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
    }
    encoder.finish();
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default saveCollectionGif;
