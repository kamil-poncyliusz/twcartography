import { parseHexColor, calcExpansionArray } from "../../../../ts/public/scripts/map-generator-helpers";

describe("parseHexColor", () => {
  test("Should parse correct input", () => {
    expect(parseHexColor("#8B50d3")).toEqual({ r: 139, g: 80, b: 211 });
    expect(parseHexColor("#80FF00")).toEqual({ r: 128, g: 255, b: 0 });
  });
  test("Should detect incorrect input", () => {
    expect(parseHexColor("a34t09hgj39tb")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHexColor("8000FF")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHexColor("#8000F")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHexColor("#8*00FF")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("calcExpansionArray", () => {
  test("Should return an array of neighboring pixels", () => {
    expect(calcExpansionArray(-5)).toEqual([]);
    expect(calcExpansionArray(0)).toEqual([[{ x: 0, y: 0 }]]);
    expect(calcExpansionArray(1)).toEqual([
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
    expect(calcExpansionArray(7)[7]).toBeDefined();
    expect(calcExpansionArray(12)[12]).toBeDefined();
  });
});
