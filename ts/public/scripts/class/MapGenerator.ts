import { parseHexColor, calcExpansionArray } from "../utils.js";
import { Settings, ParsedColor, ImageDataDummy, ParsedTurnData, Tribe, Village } from "../../../Types.js";

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

class MapGenerator {
  #backgroundColor: ParsedColor;
  #turnData: ParsedTurnData;
  #expansionArray: { x: number; y: number }[][];
  #offset: number;
  #rawPixels: RawPixel[][] = [];
  #scaledPixels: ScaledPixel[][] = [];
  #settings: Settings;
  constructor(data: ParsedTurnData, settings: Settings) {
    this.#turnData = data;
    this.#settings = settings;
    this.#backgroundColor = parseHexColor(settings.backgroundColor);
    this.#expansionArray = calcExpansionArray(settings.spotSize);
    this.#offset = (1000 - data.width) / 2;
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
    for (let i = 0; i < this.#turnData.width * this.#settings.scale; i++) {
      const row: ScaledPixel[] = [];
      for (let j = 0; j < this.#turnData.width * this.#settings.scale; j++) {
        row.push({
          color: this.#backgroundColor,
          x: i,
          y: j,
        });
      }
      this.#scaledPixels.push(row);
    }
    this.generateRawPixels();
    const smallSpots = this.#findSmallSpots();
    this.#distributeArea(smallSpots);
    this.#generateScaledPixels();
  }
  get imageData() {
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
    if (typeof process === "object") {
      const result: ImageDataDummy = {
        data: imageArray,
        width: scaledWidth,
        height: scaledWidth,
      };
      return result;
    }
    return new ImageData(imageArray, scaledWidth, scaledWidth);
  }
  #calcSpotSize(villagePoints: number) {
    const settings = this.#settings;
    const minSize = 2;
    const maxSize = settings.spotSize;
    const minPoints = settings.villageFilter;
    const maxPoints = this.#turnData.topVillagePoints;
    if (villagePoints <= minPoints) return minSize;
    if (villagePoints >= maxPoints) return maxSize;
    const size =
      Math.floor(((villagePoints - minPoints) / (maxPoints - minPoints)) * (maxSize - minSize + 1)) + minSize;
    return size;
  }
  #distributeArea(area: RawPixel[]) {
    const pixels = this.#rawPixels;
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
  #findMarkGroupOfTribe(tribe: Tribe) {
    for (const group of this.#settings.markGroups) {
      if (group.tribes.includes(tribe.id)) return group;
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
      const group = this.#findMarkGroupOfTribe(tribe);
      if (group) {
        const color = parseHexColor(group.color);
        for (const village of tribe.villages) {
          if (this.#isVillageDisplayed(village)) {
            this.#printVillageSpot(village, color);
          } else {
            //
          }
        }
      } else {
        //
      }
    }
  }
  #generateScaledPixels() {
    const width = this.#turnData.width;
    const scale = this.#settings.scale;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const pixel = this.#rawPixels[x][y];
        for (let newY = y * scale; newY < y * scale + scale; newY++) {
          for (let newX = x * scale; newX < x * scale + scale; newX++) {
            this.#scaledPixels[newX][newY].color = pixel.color;
          }
        }
      }
    }
  }
  #isVillageDisplayed(village: Village) {
    if (village.points < this.#settings.villageFilter) return false;
    const distanceFromCenter = Math.round(
      Math.sqrt((500 - village.x) * (500 - village.x) + (500 - village.y) * (500 - village.y))
    );
    if (distanceFromCenter > this.#settings.radius) return false;
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
}

export default MapGenerator;
