import { parseHexColor, calcExpansionArray } from "../utils.js";
import { Settings, ParsedColor, ParsedTurnData, Village, MarkGroup } from "../../../src/Types.js";
import { MAX_VILLAGE_POINTS, TRIBAL_WARS_MAP_SIZE } from "../constants.js";

const canvasModule = typeof process === "object" ? await import("canvas") : null;

const LEGEND_FONT_SIZE = 5;
const LEGEND_FONT_FAMILY = "sans-serif";

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
  #spotSizeStep: number;
  #turnData: ParsedTurnData;
  #maxSpotSize: number;
  #villageFilter: number;
  #widthModifier: number = 0;
  constructor(data: ParsedTurnData, settings: Settings) {
    this.#turnData = data;
    this.#settings = settings;
    this.#backgroundColor = parseHexColor(settings.backgroundColor);
    this.#maxSpotSize = 5 + Math.ceil(((MAX_VILLAGE_POINTS - data.averageVillagePoints) / MAX_VILLAGE_POINTS) * 7);
    this.#villageFilter = Math.min(Math.floor(data.averageVillagePoints * 0.9), Math.floor(MAX_VILLAGE_POINTS / 4));
    this.#spotSizeStep = Math.round((data.topVillagePoints - this.#villageFilter) / this.#maxSpotSize);
    // console.log("Filter:", this.#villageFilter, "Step:", this.#spotSizeStep, "Median:", data.medianVillagePoints, "Max spot:", this.#maxSpotSize);
    this.#expansionArray = calcExpansionArray(this.#maxSpotSize);
    this.#offset = Math.round((TRIBAL_WARS_MAP_SIZE - data.width) / 2);
    this.#legend = new Legend(this.#settings.markGroups);
    this.generateRawPixels();
    const smallSpots = this.#findSmallSpots();
    this.#distributeArea(smallSpots);
    this.#widthModifier = this.#calcWidthModifier();
    this.#generateScaledPixels();
    this.#smoothBorders();
    this.#drawBorders();
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
  #calcWidthModifier(): number {
    const margin = 10;
    if (!this.#settings.trim) {
      if (this.#settings.outputWidth === 0) return 0;
      return Math.round((this.#settings.outputWidth - this.#turnData.width) / 2);
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
  #calcSpotSize(villagePoints: number): number {
    const maxSize = this.#maxSpotSize;
    const minSize = 1;
    const minPoints = this.#villageFilter;
    const spotSizeStep = this.#spotSizeStep;
    const result = minSize + Math.floor((villagePoints - minPoints) / spotSizeStep);
    if (result > maxSize) return maxSize;
    return result;
  }
  #distributeArea(area: RawPixel[]) {
    const pixels = this.#rawPixels;
    const deletedColor = parseHexColor("#123456");
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
  #drawBorders() {
    const margin = 2;
    const pixels = this.#scaledPixels;
    if (pixels.length === 0 || pixels.length < margin * 3) return;
    const borderPixels: ScaledPixel[] = [];
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
  #findMarkGroupOfTribe(tribeID: string): MarkGroup | false {
    for (const group of this.#settings.markGroups) {
      if (group.tribes.includes(tribeID)) return group;
    }
    if (this.#settings.displayUnmarked) {
      return {
        tribes: [],
        name: "Unmarked",
        color: this.#settings.unmarkedColor,
      };
    }
    return false;
  }
  #findSmallSpots(): RawPixel[] {
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
    for (let x = 0; x < this.#turnData.width; x++) {
      const row: RawPixel[] = [];
      for (let y = 0; y < this.#turnData.width; y++) {
        row.push({
          color: this.#backgroundColor,
          priority: 0,
          counted: true,
          x: x,
          y: y,
        });
      }
      this.#rawPixels.push(row);
    }
    const colors: { [groupName: string]: ParsedColor } = {};
    for (let markGoup of this.#settings.markGroups) {
      colors[markGoup.name] = parseHexColor(markGoup.color);
    }
    const unmarkedColor = parseHexColor(this.#settings.unmarkedColor);
    for (const tribeID in this.#turnData.tribes) {
      const tribe = this.#turnData.tribes[tribeID];
      const group = this.#findMarkGroupOfTribe(tribe.id);
      if (group) {
        const color = colors[group.name] ?? unmarkedColor;
        for (const village of tribe.villages) {
          if (village.points >= this.#villageFilter) {
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
  #printVillageSpot(village: Village, color: ParsedColor) {
    const x = village.x - this.#offset;
    const y = village.y - this.#offset;
    const spotSize = this.#calcSpotSize(village.points);
    for (let d = 0; d <= spotSize; d++) {
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
  #smoothBorders() {
    const distance = 2;
    const pixels = this.#scaledPixels;
    if (pixels.length === 0 || pixels.length < distance * 3) return;
    const corrections: {
      pixel: ScaledPixel;
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
            let incremented = false;
            let colorIndex = 0;
            while (!incremented) {
              if (!countedColors[colorIndex]) {
                countedColors.push({ color: neighbor.color, count: 1 });
                incremented = true;
              } else if (countedColors[colorIndex].color === neighbor.color) {
                countedColors[colorIndex].count++;
                incremented = true;
              } else {
                colorIndex++;
              }
            }
          }
        }
        const threshold = ((distance * 2 + 1) * (distance * 2 + 1)) / 2;
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
  #writeLegend() {
    const legend = this.#legend.getLegend();
    const imageData = this.imageData;
    if (!imageData) return;
    const width = imageData.width;
    const height = imageData.height;
    if (canvasModule !== null) {
      const canvas = canvasModule.createCanvas(width, height);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return;
      ctx.putImageData(imageData, 0, 0);
      const fontSize = Math.floor((width / 100) * LEGEND_FONT_SIZE);
      ctx.font = `${fontSize}px ${LEGEND_FONT_FAMILY}`;
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
      const fontSize = Math.floor((width / 100) * LEGEND_FONT_SIZE);
      ctx.font = `${fontSize}px ${LEGEND_FONT_FAMILY}`;
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
