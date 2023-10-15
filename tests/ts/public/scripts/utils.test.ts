import { distinctiveColor, randomizeGroupColor } from "../../../../ts/public/scripts/utils";

describe("distinctiveColor", () => {
  test("Should return RGB color in the correct format", () => {
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    expect(distinctiveColor(-5)).toMatch(regex);
    expect(distinctiveColor(0)).toMatch(regex);
    expect(distinctiveColor(1)).toMatch(regex);
    expect(distinctiveColor(5)).toMatch(regex);
    expect(distinctiveColor(2384)).toMatch(regex);
  });
});

describe("randomizeGroupColor", () => {
  test("Should return RGB color in the correct format", () => {
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    for (let i = 0; i < 10; i++) {
      expect(randomizeGroupColor()).toMatch(regex);
    }
  });
});
