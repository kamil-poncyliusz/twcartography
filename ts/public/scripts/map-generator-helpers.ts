import { ParsedColor } from "../../src/types";

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

export const parseHexColor = function (color: string): ParsedColor {
  const black = { r: 0, g: 0, b: 0 };
  const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
  if (!regex.test(color)) return black;
  return { r: parseInt(color.slice(1, 3), 16), g: parseInt(color.slice(3, 5), 16), b: parseInt(color.slice(5, 7), 16) };
};
