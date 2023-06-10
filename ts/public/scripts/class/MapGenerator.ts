import { parseHexColor, calcExpansionArray } from "../utils.js";
import { Settings, ParsedColor, ParsedTurnData, Village, MarkGroup } from "../../../src/Types.js";
const canvasModule = typeof process === "object" ? await import("canvas") : null;

interface RawPixel {
  color: ParsedColor;
  counted: boolean;
  priority: number;
  newColor?: ParsedColor;
  x: number;
  y: number;
}
interface ScaledPixel {
  color: ParsedColor;
  x: number;
  y: number;
}

const NW = 0,
  NE = 1,
  SW = 2,
  SE = 3;

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
  add(groupName: string, x: number, y: number) {
    if (this.#groups[groupName] === undefined) return;
    if (y < 500) {
      if (x < 500) this.#groups[groupName].corners[NW]++;
      else this.#groups[groupName].corners[NE]++;
    } else {
      if (x < 500) this.#groups[groupName].corners[SW]++;
      else this.#groups[groupName].corners[SE]++;
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
  #backgroundColor: ParsedColor;
  #expansionArray: { x: number; y: number }[][];
  imageData: ImageData | undefined = undefined;
  #legend: Legend;
  #offset: number;
  #rawPixels: RawPixel[][] = [];
  #scaledPixels: ScaledPixel[][] = [];
  #settings: Settings;
  #turnData: ParsedTurnData;
  #widthModifier: number = 0;
  constructor(data: ParsedTurnData, settings: Settings) {
    this.#turnData = data;
    this.#settings = settings;
    this.#backgroundColor = parseHexColor(settings.backgroundColor);
    this.#expansionArray = calcExpansionArray(settings.spotSize);
    this.#offset = (1000 - data.width) / 2;
    this.#legend = new Legend(this.#settings.markGroups);
    for (let i = 0; i < this.#turnData.width; i++) {
      const row: RawPixel[] = [];
      for (let j = 0; j < this.#turnData.width; j++) {
        row.push({
          color: this.#backgroundColor,
          priority: 0,
          counted: true,
          x: i,
          y: j,
        });
      }
      this.#rawPixels.push(row);
    }
    this.generateRawPixels();
    const smallSpots = this.#findSmallSpots();
    this.#distributeArea(smallSpots);
    this.#widthModifier = this.#calcWidthModifier();
    this.#generateScaledPixels();
    this.#generateImageData();
    this.#writeLegend();
  }
  #generateImageData() {
    const scaled = this.#scaledPixels;
    const scaledWidth = scaled.length;
    const imageArray = new Uint8ClampedArray(4 * scaledWidth * scaledWidth);
    for (let x = 0; x < scaledWidth; x++) {
      for (let y = 0; y < scaledWidth; y++) {
        const color = scaled[x][y].color;
        const index = (y * scaledWidth + x) * 4;
        imageArray[index] = color.r;
        imageArray[index + 1] = color.g;
        imageArray[index + 2] = color.b;
        imageArray[index + 3] = 255;
      }
    }
    if (canvasModule !== null) this.imageData = canvasModule.createImageData(imageArray, scaledWidth, scaledWidth) as ImageData;
    else this.imageData = new ImageData(imageArray, scaledWidth, scaledWidth);
  }
  #calcWidthModifier() {
    const margin = 10;
    if (!this.#settings.trim) {
      if (this.#settings.outputWidth === 0) return 0;
      return this.#settings.outputWidth - this.#turnData.width;
    }
    for (let width = 0; width < this.#rawPixels.length / 2; width++) {
      let x = width;
      let y = width;
      while (x < this.#rawPixels.length - 1 - width) {
        if (this.#rawPixels[x][y].color !== this.#backgroundColor) return margin - width;
        x++;
      }
      while (y < this.#rawPixels.length - 1 - width) {
        if (this.#rawPixels[x][y].color !== this.#backgroundColor) return margin - width;
        y++;
      }
      while (x > width + 1) {
        if (this.#rawPixels[x][y].color !== this.#backgroundColor) return margin - width;
        x--;
      }
      while (y > width + 1) {
        if (this.#rawPixels[x][y].color !== this.#backgroundColor) return margin - width;
        y--;
      }
    }
    return 0;
  }
  #calcSpotSize(villagePoints: number) {
    const settings = this.#settings;
    const minSize = 2;
    const maxSize = settings.spotSize;
    const minPoints = settings.villageFilter;
    const maxPoints = this.#turnData.topVillagePoints;
    if (villagePoints <= minPoints) return minSize;
    if (villagePoints >= maxPoints) return maxSize;
    const size = Math.floor(((villagePoints - minPoints) / (maxPoints - minPoints)) * (maxSize - minSize + 1)) + minSize;
    return size;
  }
  #distributeArea(area: RawPixel[]) {
    const pixels = this.#rawPixels;
    const deletedColor = parseHexColor("#013467");
    for (let pixel of area) {
      pixel.color = deletedColor;
    }
    while (area.length > 0) {
      for (let pixel of area) {
        const x = pixel.x,
          y = pixel.y,
          color = pixel.color,
          neighbors = [pixels[x + 1][y], pixels[x - 1][y], pixels[x][y + 1], pixels[x][y - 1]];
        for (const neighbor of neighbors) {
          if (neighbor.color !== color) {
            pixel.newColor = neighbor.color;
            break;
          }
        }
      }
      for (let i = area.length - 1; i >= 0; i--) {
        const pixel = area[i];
        if (pixel.newColor) {
          pixel.color = pixel.newColor;
          area.splice(i, 1);
        }
      }
    }
  }
  #findMarkGroupOfTribe(tribeId: string) {
    for (const group of this.#settings.markGroups) {
      if (group.tribes.includes(tribeId)) return group;
    }
    if (this.#settings.displayUnmarked) {
      return {
        tribes: [],
        name: "",
        color: this.#settings.unmarkedColor,
      };
    }
    return false;
  }
  #findSmallSpots() {
    const pixels = this.#rawPixels;
    const smallSpots: RawPixel[] = [];
    for (let x = 0; x < pixels.length; x++) {
      for (let y = 0; y < pixels.length; y++) {
        const pixel = pixels[x][y];
        if (!pixel.counted) {
          let area = 0;
          const areaPixels: RawPixel[] = [];
          const color = pixel.color;
          const toCheck: RawPixel[] = [];
          toCheck.push(pixel);
          while (toCheck.length > 0) {
            const checkedPixel = toCheck.pop() as RawPixel;
            if (!checkedPixel.counted && checkedPixel.color === color) {
              checkedPixel.counted = true;
              if (area < this.#settings.spotsFilter) areaPixels.push(checkedPixel);
              area++;
              toCheck.push(pixels[checkedPixel.x + 1][checkedPixel.y]);
              toCheck.push(pixels[checkedPixel.x - 1][checkedPixel.y]);
              toCheck.push(pixels[checkedPixel.x][checkedPixel.y + 1]);
              toCheck.push(pixels[checkedPixel.x][checkedPixel.y - 1]);
            }
          }
          if (area < this.#settings.spotsFilter) {
            smallSpots.push(...areaPixels);
          }
        }
      }
    }
    return smallSpots;
  }
  generateRawPixels() {
    for (const tribeId in this.#turnData.tribes) {
      const tribe = this.#turnData.tribes[tribeId];
      const group = this.#findMarkGroupOfTribe(tribe.id);
      if (group) {
        const color = parseHexColor(group.color);
        for (const village of tribe.villages) {
          if (this.#isVillageDisplayed(village)) {
            this.#printVillageSpot(village, color);
            this.#legend.add(group.name, village.x, village.y);
          }
        }
      }
    }
  }
  #generateScaledPixels() {
    const width = this.#turnData.width;
    const scale = this.#settings.scale;
    const widthModifier = this.#widthModifier;
    const modifiedWidth = width + 2 * widthModifier;
    for (let i = 0; i < modifiedWidth * scale; i++) {
      const row: ScaledPixel[] = [];
      for (let j = 0; j < modifiedWidth * scale; j++) {
        row.push({
          color: this.#backgroundColor,
          x: i,
          y: j,
        });
      }
      this.#scaledPixels.push(row);
    }
    if (widthModifier <= 0) {
      for (let x = 0; x < modifiedWidth; x++) {
        for (let y = 0; y < modifiedWidth; y++) {
          const pixel = this.#rawPixels[x - widthModifier][y - widthModifier];
          for (let newY = y * scale; newY < y * scale + scale; newY++) {
            for (let newX = x * scale; newX < x * scale + scale; newX++) {
              this.#scaledPixels[newX][newY].color = pixel.color;
            }
          }
        }
      }
    } else {
      for (let x = widthModifier; x < width + widthModifier; x++) {
        for (let y = widthModifier; y < width + widthModifier; y++) {
          const pixel = this.#rawPixels[x - widthModifier][y - widthModifier];
          for (let newY = y * scale; newY < y * scale + scale; newY++) {
            for (let newX = x * scale; newX < x * scale + scale; newX++) {
              this.#scaledPixels[newX][newY].color = pixel.color;
            }
          }
        }
      }
    }
  }
  #isVillageDisplayed(village: Village) {
    if (village.points < this.#settings.villageFilter) return false;
    return true;
  }
  #printVillageSpot(village: Village, color: ParsedColor) {
    const x = village.x - this.#offset;
    const y = village.y - this.#offset;
    const spotSize = this.#calcSpotSize(village.points);
    for (let d = 0; d < spotSize; d++) {
      for (let expansion of this.#expansionArray[d]) {
        const pixel = this.#rawPixels[x + expansion.x][y + expansion.y];
        if (spotSize - d > pixel.priority) {
          pixel.priority = spotSize - d;
          pixel.color = color;
          pixel.counted = false;
        }
      }
    }
  }
  #writeLegend() {
    const legend = this.#legend.getLegend();
    const imageData = this.imageData as ImageData;
    const width = imageData.width;
    const height = imageData.height;
    if (canvasModule !== null) {
      const canvas = canvasModule.createCanvas(width, height);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return;
      ctx.putImageData(imageData, 0, 0);
      const fontSize = Math.round(width / 20);
      ctx.font = `${fontSize}px sans-serif`;
      for (let cornerIndex = 0; cornerIndex < legend.length; cornerIndex++) {
        let step = 0,
          startX = 0,
          startY = 0;
        if (cornerIndex === NW || cornerIndex === NE) {
          step = fontSize;
          startY = Math.round(fontSize * 0.9);
        } else {
          step = -fontSize;
          startY = Math.round(height - fontSize * 0.2);
        }
        if (cornerIndex === NW || cornerIndex === SW) {
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
      this.imageData = resultImageData as ImageData;
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return;
      ctx.putImageData(imageData, 0, 0);
      const fontSize = Math.round(width / 20);
      ctx.font = `${fontSize}px sans-serif`;
      for (let cornerIndex = 0; cornerIndex < legend.length; cornerIndex++) {
        let step = 0,
          startX = 0,
          startY = 0;
        if (cornerIndex === NW || cornerIndex === NE) {
          step = fontSize;
          startY = Math.round(fontSize * 0.9);
        } else {
          step = -fontSize;
          startY = Math.round(height - fontSize * 0.2);
        }
        if (cornerIndex === NW || cornerIndex === SW) {
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
      this.imageData = resultImageData;
    }
  }
}

export default MapGenerator;
