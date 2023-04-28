import { parseHexColor, calcExpansionArray, distinctiveColor } from "../../../../ts/public/scripts/utils";

describe("parseHexColor", () => {
  test("Should parse correct input", () => {
    expect(parseHexColor("#8B50d3")).toEqual({ r: 139, g: 80, b: 211 });
    expect(parseHexColor("#80FF00")).toEqual({ r: 128, g: 255, b: 0 });
  });
  test("Should detect incorrect input", () => {
    expect(parseHexColor("a34t09hgj39tb")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHexColor("8000FF")).toEqual({ r: 0, g: 0, b: 0 });
  });
});
describe("calcNeighborsArray", () => {
  test("Should create array or neighboring pixels", () => {
    expect(calcExpansionArray(-5)).toEqual([]);
    expect(calcExpansionArray(0)).toEqual([[{ x: 0, y: 0 }]]);
    expect(calcExpansionArray(1)).toEqual([[{ x: 0, y: 0 }]]);
    expect(calcExpansionArray(2)).toEqual([
      [{ x: 0, y: 0 }],
      [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
    ]);
  });
});
describe("distinctiveColor", () => {
  test("Should return RGB color in correct format", () => {
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    expect(distinctiveColor(-5)).toMatch(regex);
    expect(distinctiveColor(0)).toMatch(regex);
    expect(distinctiveColor(1)).toMatch(regex);
    expect(distinctiveColor(5)).toMatch(regex);
    expect(distinctiveColor(2384)).toMatch(regex);
  });
});
