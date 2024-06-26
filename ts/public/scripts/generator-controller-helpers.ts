import { World } from "@prisma/client";

const MIN_SATURATION = 45;
const MAX_SATURATION = 90;
const MIN_LIGHTNESS = 20;
const MAX_LIGHTNESS = 60;

const randomInt = function (min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
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

export const randomizeGroupColor = function (): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = randomInt(MIN_SATURATION, MAX_SATURATION) / 100;
  const lightness = randomInt(MIN_LIGHTNESS, MAX_LIGHTNESS) / 100;
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

export const selectInputValue = function (e: Event) {
  const input = e.target as HTMLInputElement;
  input.select();
};
