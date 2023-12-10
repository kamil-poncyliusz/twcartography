import fs from "fs/promises";
import { createCanvas, loadImage } from "canvas";
import gifencoder from "gifencoder";

const animationsDirectory = "public/images/animations";
const mapsDirectory = "public/images/maps";

const saveCollectionGif = async function (animationId: number, frames: number[], frameInterval: number): Promise<boolean> {
  try {
    const lastFrame = await loadImage(`${mapsDirectory}/${frames[frames.length - 1]}.png`);
    const width = lastFrame.width;
    const height = lastFrame.height;
    try {
      await fs.access(animationsDirectory);
    } catch {
      await fs.mkdir(animationsDirectory, { recursive: true });
    }
    const encoder = new gifencoder(width, height);
    const encoderStream = encoder.createReadStream();
    const fileHandle = await fs.open(`${animationsDirectory}/${animationId}.gif`, "w");
    const writeStream = fileHandle.createWriteStream();
    encoderStream.pipe(writeStream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(frameInterval);
    encoder.setQuality(10);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    for (const frame of frames) {
      const image = await loadImage(`${mapsDirectory}/${frame}.png`);
      ctx.drawImage(image, 0, 0);
      encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
    }
    encoder.finish();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default saveCollectionGif;
