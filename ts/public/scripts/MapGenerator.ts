import { parseHexColor, calcExpansionArray } from "./utils.js";
import { Settings, ParsedColor, ImageDataDummy, ParsedTurnData, Tribe, Village } from "./Types.js";

interface RawPixel {
  color: ParsedColor;
  counted: boolean;
  distance: number;
  newColor: ParsedColor;
  x: number;
  y: number;
}
interface ScaledPixel {
  color: ParsedColor;
  x: number;
  y: number;
}

class MapGenerator {
  backgroundColor: ParsedColor;
  data: ParsedTurnData;
  expansionArray: { x: number; y: number }[][];
  offset: number;
  raw: RawPixel[][] = [];
  scaled: ScaledPixel[][] = [];
  settings: Settings;
  constructor(data: ParsedTurnData, settings: Settings) {
    this.data = data;
    this.settings = settings;
    this.backgroundColor = parseHexColor(settings.backgroundColor);
    this.expansionArray = calcExpansionArray(settings.spotSize);
    this.offset = (1000 - data.width) / 2;
    // this. = new Uint8ClampedArray(4*data.width*data.width*settings.scale*settings.scale);
    for (let i = 0; i < this.data.width; i++) {
      const row: RawPixel[] = [];
      for (let j = 0; j < this.data.width; j++) {
        row.push({
          color: this.backgroundColor,
          distance: settings.spotSize + 1,
          counted: true,
          newColor: this.backgroundColor,
          x: i,
          y: j,
        });
      }
      this.raw.push(row);
    }
    for (let i = 0; i < this.data.width * this.settings.scale; i++) {
      const row: ScaledPixel[] = [];
      for (let j = 0; j < this.data.width * this.settings.scale; j++) {
        row.push({
          color: this.backgroundColor,
          x: i,
          y: j,
        });
      }
      this.scaled.push(row);
    }
    this.generate();
    const smallSpots = this.findSmallSpots();
    this.distributeArea(smallSpots);
    this.scale();
  }
  get imageData() {
    const imageArray = new Uint8ClampedArray(4 * this.scaled.length * this.scaled.length);
    for (let x = 0; x < this.scaled.length; x++) {
      for (let y = 0; y < this.scaled.length; y++) {
        const color = this.scaled[x][y].color;
        const index = (y * this.scaled.length + x) * 4;
        imageArray[index] = color.r;
        imageArray[index + 1] = color.g;
        imageArray[index + 2] = color.b;
        imageArray[index + 3] = 255;
      }
    }
    if (typeof process === "object") {
      const result: ImageDataDummy = {
        data: imageArray,
        width: this.scaled.length,
        height: this.scaled.length,
      };
      return result;
    }
    return new ImageData(imageArray, this.scaled.length, this.scaled.length);
  }
  distributeArea(area: RawPixel[]) {
    while (area.length > 0) {
      area.forEach((element) => {
        const x = element.x;
        const y = element.y;
        const color = element.color;
        const neighbors = [this.raw[x + 1][y], this.raw[x - 1][y], this.raw[x][y + 1], this.raw[x][y - 1]];
        for (const neighbor of neighbors) {
          if (neighbor.color !== color) {
            element.newColor = neighbor.color;
            break;
          }
        }
      });
      area.forEach((element, index) => {
        if (element.color !== element.newColor) {
          element.color = element.newColor;
          area.splice(index, 1);
        }
      });
      for (let i = area.length - 1; i >= 0; i--) {
        const pixel = area[i];
        if (pixel.color !== pixel.newColor) {
          pixel.color = pixel.newColor;
          area.splice(i, 1);
        }
      }
    }
  }
  generate() {
    for (const tribeId in this.data.tribes) {
      const tribe = this.data.tribes[tribeId];
      const group = this.isTribeMarked(tribe);
      if (group) {
        const color = parseHexColor(group.color);
        for (const village of tribe.villages) {
          if (this.isVillageDisplayed(village)) {
            this.printVillageSpot(village, color);
          } else {
            //
          }
        }
      } else {
        //
      }
    }
  }
  findSmallSpots() {
    const result: RawPixel[] = [];
    for (let x = 0; x < this.raw.length; x++) {
      for (let y = 0; y < this.raw.length; y++) {
        const pixel = this.raw[x][y];
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
              area++;
              areaPixels.push(checkedPixel);
              toCheck.push(this.raw[checkedPixel.x + 1][checkedPixel.y]);
              toCheck.push(this.raw[checkedPixel.x - 1][checkedPixel.y]);
              toCheck.push(this.raw[checkedPixel.x][checkedPixel.y + 1]);
              toCheck.push(this.raw[checkedPixel.x][checkedPixel.y - 1]);
            }
          }
          if (area < this.settings.spotsFilter) {
            result.push(...areaPixels);
          }
        }
      }
    }
    return result;
  }
  isTribeMarked(tribe: Tribe) {
    for (const group of this.settings.markGroups) {
      if (group.tribes.includes(tribe.id)) return group;
    }
    return false;
  }
  isVillageDisplayed(village: Village) {
    if (village.points < this.settings.villageFilter) return false;
    const distanceFromCenter = Math.round(
      Math.sqrt((500 - village.x) * (500 - village.x) + (500 - village.y) * (500 - village.y))
    );
    if (distanceFromCenter > this.settings.radius) return false;
    return true;
  }
  printVillageSpot(village: Village, color: ParsedColor) {
    const x = village.x - this.offset;
    const y = village.y - this.offset;
    for (let d = 0; d < this.settings.spotSize; d++) {
      const expansionArray = this.expansionArray[d];
      for (let expansion of expansionArray) {
        const pixel = this.raw[x + expansion.x][y + expansion.y];
        if (pixel.distance > d) {
          pixel.distance = d;
          pixel.color = color;
        }
      }
    }
  }
  scale() {
    const width = this.data.width;
    const scale = this.settings.scale;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const pixel = this.raw[x][y];
        for (let newY = y * scale; newY < y * scale + scale; newY++) {
          for (let newX = x * scale; newX < x * scale + scale; newX++) {
            this.scaled[newX][newY].color = pixel.color;
          }
        }
      }
    }
  }
}

export default MapGenerator;
