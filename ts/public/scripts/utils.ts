import { ParsedColor } from "../../src/Types";

const randomInt = function (min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

export const parseHexColor = function (color: string): ParsedColor {
  const black = { r: 0, g: 0, b: 0 };
  const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
  if (!regex.test(color)) return black;
  return { r: parseInt(color.slice(1, 3), 16), g: parseInt(color.slice(3, 5), 16), b: parseInt(color.slice(5, 7), 16) };
};

export const calcExpansionArray = function (n: number) {
  if (n < 0) return [];
  if (n === 0) return [[{ x: 0, y: 0 }]];
  const result: { x: number; y: number }[][] = [];
  for (let i = 0; i <= n; i++) {
    result.push([]);
  }
  let distance: number;
  for (let i = n * -1; i <= n; i++) {
    for (let j = n * -1; j <= n; j++) {
      distance = Math.hypot(i, j);
      distance = Math.round(distance);
      if (distance <= n) result[distance].push({ x: i, y: j });
    }
  }
  return result;
};

export const distinctiveColor = function (index: number): string {
  const colorsOld = [
    "#68affc",
    "#84317b",
    "#88cc1f",
    "#5336c5",
    "#80c6b8",
    "#335862",
    "#12d388",
    "#f82387",
    "#298837",
    "#fe74fe",
    "#00d618",
    "#903235",
    "#ec9850",
    "#125cb9",
    "#d995d0",
    "#9620fc",
    "#d4c95c",
    "#fd2c3b",
    "#d4c3bd",
    "#694e0b",
  ];
  const colors = [
    "#FFB300",
    "#803E75",
    "#FF6800",
    "#A6BDD7",
    "#C10020",
    "#CEA262",
    "#007D34",
    "#F6768E",
    "#00538A",
    "#FF7A5C",
    "#53377A",
    "#FF8E00",
    "#B32851",
    "#F4C800",
    "#7F180D",
    "#93AA00",
    "#593315",
    "#F13A13",
    "#232C16",
  ];
  if (index >= 0 && index < colors.length) return colors[index];
  return "#808080";
};

export const randomizeGroupColor = function () {
  const minSaturation = 45;
  const maxSaturation = 90;
  const minLightness = 20;
  const maxLightness = 60;
  const hue = Math.floor(Math.random() * 360);
  const saturation = randomInt(minSaturation, maxSaturation) / 100;
  const lightness = randomInt(minLightness, maxLightness) / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (0 <= hue && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= hue && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= hue && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= hue && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= hue && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= hue && hue < 360) {
    r = c;
    g = 0;
    b = x;
  }
  const red = Math.round((r + m) * 255).toString(16);
  const green = Math.round((g + m) * 255).toString(16);
  const blue = Math.round((b + m) * 255).toString(16);
  let result = "#";
  if (red.length === 1) result += "0";
  result += red;
  if (green.length === 1) result += "0";
  result += green;
  if (blue.length === 1) result += "0";
  result += blue;
  return result;
};
