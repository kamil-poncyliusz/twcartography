import { calcExpansionArray, parseHexColor } from "../map-generator-helpers.js";
import { MAX_VILLAGE_POINTS, TRIBAL_WARS_MAP_SIZE } from "../constants.js";
import { Settings, ParsedColor, ParsedTurnData, Village, MarkGroup } from "../../../src/types.js";

const canvasModule = typeof process === "object" ? await import("canvas") : null;
const CANVAS_FONT_FAMILY = "sans-serif";
const MIN_SPOT_SIZE = 2;

interface PixelInfluence {
  markGroups: { [markGroupIndex: number]: number };
  x: number;
  y: number;
}

interface RawPixel {
  color: ParsedColor;
  x: number;
  y: number;
}

const NORTH_WEST = 0,
  NORTH_EAST = 1,
  SOUTH_WEST = 2,
  SOUTH_EAST = 3;

const getPixelStrongestMarkGroupIndex = function (markGroups: { [markGroupIndex: number]: number }) {
  let strongest = -1;
  let maxStrength = 0;
  for (const markGroupIndex in markGroups) {
    const strength = markGroups[markGroupIndex];
    const indexAsNumber = parseInt(markGroupIndex);
    if (strength > maxStrength) {
      strongest = indexAsNumber;
      maxStrength = strength;
    }
  }
  return strongest;
};

class Legend {
  #groups: { [key: string]: { color: string; corners: number[] } } = {};
  constructor(markGroups: MarkGroup[]) {
    for (let markGroup of markGroups) {
      this.#groups[markGroup.name] = {
        color: markGroup.color,
        corners: [0, 0, 0, 0],
      };
    }
  }
  add(groupName: string, x: number, y: number, middleIndex: number) {
    if (this.#groups[groupName] === undefined) return console.log(`Legend error: ${groupName} group not found`);
    if (y < middleIndex) {
      if (x < middleIndex) this.#groups[groupName].corners[NORTH_WEST]++;
      else this.#groups[groupName].corners[NORTH_EAST]++;
    } else {
      if (x < middleIndex) this.#groups[groupName].corners[SOUTH_WEST]++;
      else this.#groups[groupName].corners[SOUTH_EAST]++;
    }
  }
  getLegend() {
    const result: { name: string; color: string }[][] = [[], [], [], []];
    for (let groupName in this.#groups) {
      const group = this.#groups[groupName];
      const corners = group.corners;
      let assignedTo = 0;
      for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex++) {
        if (corners[cornerIndex] > corners[assignedTo]) assignedTo = cornerIndex;
      }
      result[assignedTo].push({ name: groupName, color: group.color });
    }
    return result;
  }
}

class MapGenerator {
  #backgroundColor: ParsedColor = parseHexColor("#202020");
  #expansionArray: { x: number; y: number }[][] = [];
  #imageData: ImageData | undefined = undefined;
  isPixelsInfluenceStageModified: boolean = true;
  isRawPixelsStageModified: boolean = true;
  isImageDataStageModified: boolean = true;
  #legend: Legend = new Legend([]);
  #offset: number;
  #pixelsInfluenceMatrix: PixelInfluence[][] | undefined = undefined;
  #rawPixelsMatrix: RawPixel[][] | undefined = undefined;
  #settings: Settings;
  #turnData: ParsedTurnData;
  #villagePointThresholds: number[] = [0, MAX_VILLAGE_POINTS];
  #widthModifier: number = 0;
  constructor(data: ParsedTurnData, settings: Settings) {
    this.#turnData = data;
    this.#settings = settings;
    this.#offset = Math.round((TRIBAL_WARS_MAP_SIZE - data.width) / 2);
  }
  #calcSpotSize(villagePoints: number): number {
    const thresholds = this.#villagePointThresholds;
    let left = 0;
    let right = thresholds.length - 1;
    let result = 0;
    while (left <= right) {
      const pointer = Math.floor((left + right) / 2);
      if (thresholds[pointer] < villagePoints) {
        result = pointer;
        left = pointer + 1;
      } else {
        right = pointer - 1;
      }
    }
    return result + MIN_SPOT_SIZE;
  }
  #calcVillagePointThresholds(): number[] {
    const numberOfThresholds = this.#settings.topSpotSize - MIN_SPOT_SIZE + 1;
    const villagePointsArray: number[] = [];
    const thresholds: number[] = [];
    for (const markGroup of this.#settings.markGroups) {
      for (const tribeId of markGroup.tribes) {
        const tribe = this.#turnData.tribes[tribeId];
        if (!tribe) continue;
        for (const village of tribe.villages) {
          villagePointsArray.push(village.points);
        }
      }
    }
    villagePointsArray.sort((a, b) => a - b);
    const numberOfVillages = villagePointsArray.length;
    for (let n = 0; n < numberOfThresholds; n++) {
      const index = Math.round((numberOfVillages / numberOfThresholds) * n);
      thresholds.push(villagePointsArray[index]);
    }
    this.#villagePointThresholds = thresholds;
    return this.#villagePointThresholds;
  }
  #calcWidthModifier(): number {
    if (!this.#pixelsInfluenceMatrix) throw new Error("MapGenerator: pixels influence matrix in undefined");
    const margin = 10;
    if (!this.#settings.trim) {
      if (this.#settings.outputWidth === 0) return 0;
      return Math.round((this.#settings.outputWidth - this.#turnData.width) / 2);
    }
    for (let width = 0; width < this.#pixelsInfluenceMatrix.length / 2; width++) {
      let x = width;
      let y = width;
      while (x < this.#pixelsInfluenceMatrix.length - 1 - width) {
        if (Object.keys(this.#pixelsInfluenceMatrix[x][y].markGroups).length > 0) return margin - width;
        x++;
      }
      while (y < this.#pixelsInfluenceMatrix.length - 1 - width) {
        if (Object.keys(this.#pixelsInfluenceMatrix[x][y].markGroups).length > 0) return margin - width;
        y++;
      }
      while (x > width + 1) {
        if (Object.keys(this.#pixelsInfluenceMatrix[x][y].markGroups).length > 0) return margin - width;
        x--;
      }
      while (y > width + 1) {
        if (Object.keys(this.#pixelsInfluenceMatrix[x][y].markGroups).length > 0) return margin - width;
        y--;
      }
    }
    return 0;
  }
  #createImageData() {
    const pixels = this.#rawPixelsMatrix;
    if (!pixels) throw new Error("MapGenerator: raw pixels matrix is undefined");
    const scaledWidth = pixels.length;
    const imageArray = new Uint8ClampedArray(4 * scaledWidth * scaledWidth);
    for (let x = 0; x < scaledWidth; x++) {
      for (let y = 0; y < scaledWidth; y++) {
        const color = pixels[x][y].color;
        const index = (y * scaledWidth + x) * 4;
        imageArray[index] = color.r;
        imageArray[index + 1] = color.g;
        imageArray[index + 2] = color.b;
        imageArray[index + 3] = 255;
      }
    }
    if (canvasModule !== null) this.#imageData = canvasModule.createImageData(imageArray, scaledWidth, scaledWidth) as ImageData;
    else this.#imageData = new ImageData(imageArray, scaledWidth, scaledWidth);
  }
  #createPixelInfluenceMatrix() {
    this.#pixelsInfluenceMatrix = [];
    this.#villagePointThresholds = this.#calcVillagePointThresholds();
    for (let x = 0; x < this.#turnData.width; x++) {
      const row: PixelInfluence[] = [];
      for (let y = 0; y < this.#turnData.width; y++) {
        row.push({
          markGroups: {},
          x: x,
          y: y,
        });
      }
      this.#pixelsInfluenceMatrix.push(row);
    }
    for (const tribeId in this.#turnData.tribes) {
      const tribe = this.#turnData.tribes[tribeId];
      const markGroupIndex = this.#findMarkGroupIndexOfTribe(tribe.id);
      const markGroup = this.#settings.markGroups[markGroupIndex];
      if (markGroupIndex >= 0) {
        for (const village of tribe.villages) {
          this.#printVillageSpot(village, markGroupIndex);
        }
      }
    }
  }
  #createRawPixelsMatrix() {
    if (!this.#pixelsInfluenceMatrix) throw new Error("MapGenerator: raw pixels matrix is undefined");
    this.#rawPixelsMatrix = [];
    const width = this.#turnData.width;
    const scale = this.#settings.scale;
    const widthModifier = this.#widthModifier;
    const modifiedWidth = width + 2 * widthModifier;
    const markGroupColors: ParsedColor[] = [];
    for (let markGroup of this.#settings.markGroups) {
      markGroupColors.push(parseHexColor(markGroup.color));
    }
    for (let i = 0; i < modifiedWidth * scale; i++) {
      const row: RawPixel[] = [];
      for (let j = 0; j < modifiedWidth * scale; j++) {
        row.push({
          color: this.#backgroundColor,
          x: i,
          y: j,
        });
      }
      this.#rawPixelsMatrix.push(row);
    }
    const transformationStartIndex = widthModifier <= 0 ? 0 : widthModifier;
    const transformationEndIndex = widthModifier <= 0 ? modifiedWidth : width + widthModifier;
    const middleIndex = Math.round((transformationStartIndex + transformationEndIndex) / 2);
    for (let x = transformationStartIndex; x < transformationEndIndex; x++) {
      for (let y = transformationStartIndex; y < transformationEndIndex; y++) {
        const pixel = this.#pixelsInfluenceMatrix[x - widthModifier][y - widthModifier];
        const markGroupIndex = getPixelStrongestMarkGroupIndex(pixel.markGroups);
        if (markGroupIndex === -1) continue;
        const markGroup = this.#settings.markGroups[markGroupIndex];
        this.#legend.add(markGroup.name, x, y, middleIndex);
        for (let newY = y * scale; newY < y * scale + scale; newY++) {
          for (let newX = x * scale; newX < x * scale + scale; newX++) {
            this.#rawPixelsMatrix[newX][newY].color = markGroupColors[markGroupIndex];
          }
        }
      }
    }
  }
  #drawBorders() {
    const margin = 2;
    const pixels = this.#rawPixelsMatrix;
    if (!pixels) throw new Error("MapGenerator: raw pixels matrix is undefined");
    if (pixels.length === 0 || pixels.length < margin * 3) return;
    const borderPixels: RawPixel[] = [];
    for (let x = margin; x < pixels.length - margin; x++) {
      for (let y = margin; y < pixels.length - margin; y++) {
        const pixel = pixels[x][y];
        const color = pixel.color;
        if (
          pixel.color !== this.#backgroundColor &&
          ((pixels[x + 1][y].color !== color && pixels[x + 1][y].color !== this.#backgroundColor) ||
            (pixels[x - 1][y].color !== color && pixels[x - 1][y].color !== this.#backgroundColor) ||
            (pixels[x][y + 1].color !== color && pixels[x][y + 1].color !== this.#backgroundColor) ||
            (pixels[x][y - 1].color !== color && pixels[x][y - 1].color !== this.#backgroundColor))
        )
          borderPixels.push(pixel);
      }
    }
    const borderColor = parseHexColor(this.#settings.borderColor);
    for (let borderPixel of borderPixels) {
      borderPixel.color = borderColor;
    }
  }
  #drawCaptions() {
    const captions = this.#settings.captions;
    const imageData = this.#imageData;
    if (!imageData) return console.log("MapGenerator: imageData is undefined");
    const width = imageData.width;
    const height = imageData.height;
    if (canvasModule !== null) {
      const canvas = canvasModule.createCanvas(width, height);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return console.log("MapGenerator: canvas context in null");
      ctx.putImageData(imageData, 0, 0);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (let caption of captions) {
        ctx.font = `${caption.fontSize}px ${CANVAS_FONT_FAMILY}`;
        ctx.fillStyle = caption.color;
        ctx.fillText(caption.text, caption.x, caption.y);
      }
      const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
      this.#imageData = resultImageData as ImageData;
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return console.log("MapGenerator: canvas context in null");
      ctx.putImageData(imageData, 0, 0);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (let caption of captions) {
        ctx.font = `${caption.fontSize}px ${CANVAS_FONT_FAMILY}`;
        ctx.fillStyle = caption.color;
        ctx.fillText(caption.text, caption.x, caption.y);
      }
      const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
      this.#imageData = resultImageData;
    }
  }
  #drawLegend() {
    const legend = this.#legend.getLegend();
    const imageData = this.#imageData;
    if (!imageData) return console.log("MapGenerator: imageData is undefined");
    const width = imageData.width;
    const height = imageData.height;
    if (canvasModule !== null) {
      const canvas = canvasModule.createCanvas(width, height);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return console.log("MapGenerator: canvas context in null");
      ctx.putImageData(imageData, 0, 0);
      const fontSize = Math.floor((width / 100) * this.#settings.legendFontSize);
      ctx.font = `${fontSize}px ${CANVAS_FONT_FAMILY}`;
      ctx.textBaseline = "alphabetic";
      for (let cornerIndex = 0; cornerIndex < legend.length; cornerIndex++) {
        let step = 0,
          startX = 0,
          startY = 0;
        if (cornerIndex === NORTH_WEST || cornerIndex === NORTH_EAST) {
          step = fontSize;
          startY = Math.round(fontSize * 0.9);
        } else {
          step = -fontSize;
          startY = Math.round(height - fontSize * 0.2);
        }
        if (cornerIndex === NORTH_WEST || cornerIndex === SOUTH_WEST) {
          ctx.textAlign = "left";
          startX = Math.round(fontSize * 0.1);
        } else {
          ctx.textAlign = "right";
          startX = Math.round(width - fontSize * 0.1);
        }
        for (let groupIndex = 0; groupIndex < legend[cornerIndex].length; groupIndex++) {
          const group = legend[cornerIndex][groupIndex];
          ctx.fillStyle = group.color;
          const x = startX;
          const y = startY + groupIndex * step;
          ctx.fillText(group.name, x, y);
        }
      }
      const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
      this.#imageData = resultImageData as ImageData;
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return console.log("MapGenerator: canvas context in null");
      ctx.putImageData(imageData, 0, 0);
      const fontSize = Math.floor((width / 100) * this.#settings.legendFontSize);
      ctx.font = `${fontSize}px ${CANVAS_FONT_FAMILY}`;
      ctx.textBaseline = "alphabetic";
      for (let cornerIndex = 0; cornerIndex < legend.length; cornerIndex++) {
        let step = 0,
          startX = 0,
          startY = 0;
        if (cornerIndex === NORTH_WEST || cornerIndex === NORTH_EAST) {
          step = fontSize;
          startY = Math.round(fontSize * 0.9);
        } else {
          step = -fontSize;
          startY = Math.round(height - fontSize * 0.2);
        }
        if (cornerIndex === NORTH_WEST || cornerIndex === SOUTH_WEST) {
          ctx.textAlign = "left";
          startX = Math.round(fontSize * 0.1);
        } else {
          ctx.textAlign = "right";
          startX = Math.round(width - fontSize * 0.1);
        }
        for (let groupIndex = 0; groupIndex < legend[cornerIndex].length; groupIndex++) {
          const group = legend[cornerIndex][groupIndex];
          ctx.fillStyle = group.color;
          const x = startX;
          const y = startY + groupIndex * step;
          ctx.fillText(group.name, x, y);
        }
      }
      const resultImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
      this.#imageData = resultImageData;
    }
  }
  #findMarkGroupIndexOfTribe(tribeId: string): number {
    for (let index = 0; index < this.#settings.markGroups.length; index++) {
      const group = this.#settings.markGroups[index];
      if (group.tribes.includes(tribeId)) return index;
    }
    return -1;
  }
  getMap(): ImageData {
    let updateRemainingStages = false;
    if (updateRemainingStages || this.isPixelsInfluenceStageModified || !this.#pixelsInfluenceMatrix) {
      this.#expansionArray = calcExpansionArray(this.#settings.topSpotSize);
      this.#createPixelInfluenceMatrix();
      updateRemainingStages = true;
      this.isPixelsInfluenceStageModified = false;
    }
    if (updateRemainingStages || this.isRawPixelsStageModified || !this.#rawPixelsMatrix) {
      this.#legend = new Legend(this.#settings.markGroups);
      this.#backgroundColor = parseHexColor(this.#settings.backgroundColor);
      this.#widthModifier = this.#calcWidthModifier();
      this.#createRawPixelsMatrix();
      if (this.#settings.smoothBorders) this.#smoothBorders();
      if (this.#settings.drawBorders) this.#drawBorders();
      updateRemainingStages = true;
      this.isRawPixelsStageModified = false;
    }
    if (updateRemainingStages || this.isImageDataStageModified || !this.#imageData) {
      this.#createImageData();
      if (this.#settings.drawLegend) this.#drawLegend();
      this.#drawCaptions();
      this.isImageDataStageModified = false;
    }
    if (!this.#imageData) throw new Error("MapGenerator: imageData is undefined");
    return this.#imageData;
  }
  #printVillageSpot(village: Village, markGroupIndex: number) {
    if (!this.#pixelsInfluenceMatrix) throw new Error("MapGenerator: raw pixels matrix is undefined");
    const x = village.x - this.#offset;
    const y = village.y - this.#offset;
    const spotSize = this.#calcSpotSize(village.points);
    for (let d = 0; d <= spotSize; d++) {
      for (let expansion of this.#expansionArray[d]) {
        const pixel = this.#pixelsInfluenceMatrix[x + expansion.x][y + expansion.y];
        if (!pixel) continue;
        if (pixel.markGroups[markGroupIndex]) pixel.markGroups[markGroupIndex] += spotSize - d;
        else pixel.markGroups[markGroupIndex] = spotSize - d;
      }
    }
  }
  #smoothBorders() {
    const pixels = this.#rawPixelsMatrix;
    if (!pixels) throw new Error("MapGenerator: raw pixels matrix is undefined");
    const distance = 2;
    if (pixels.length === 0 || pixels.length < distance * 3) return console.log("MapGenerator: cannot smooth borders, map is too small");
    const corrections: {
      pixel: RawPixel;
      newColor: ParsedColor;
    }[] = [];
    for (let x = distance; x < pixels.length - distance; x++) {
      for (let y = distance; y < pixels.length - distance; y++) {
        const pixel = pixels[x][y];
        const countedColors: {
          color: ParsedColor;
          count: number;
        }[] = [];
        countedColors.push({ color: pixel.color, count: 0 });
        for (let neighborX = x - distance; neighborX <= x + distance; neighborX++) {
          for (let neighborY = y - distance; neighborY <= y + distance; neighborY++) {
            const neighbor = pixels[neighborX][neighborY];
            const countedColorIndex = countedColors.findIndex((countedColor) => countedColor.color === neighbor.color);
            if (countedColorIndex === -1) countedColors.push({ color: neighbor.color, count: 1 });
            else countedColors[countedColorIndex].count++;
          }
        }
        const numberOfFieldsCounted = (distance + 1 + distance) * (distance + 1 + distance);
        const threshold = numberOfFieldsCounted / 2;
        if (countedColors[0].count < threshold) {
          for (let countedColor of countedColors) {
            if (countedColor.count > countedColors[0].count) {
              corrections.push({ pixel: pixel, newColor: countedColor.color });
              break;
            }
          }
        }
      }
    }
    for (let correction of corrections) {
      correction.pixel.color = correction.newColor;
    }
  }
}

export default MapGenerator;
