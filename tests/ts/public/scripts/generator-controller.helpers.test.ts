import { randomizeGroupColor } from "../../../../ts/public/scripts/generator-controller-helpers";

describe("randomizeGroupColor", () => {
  test("Should return RGB color in the correct format", () => {
    const regex = new RegExp("^#[A-Fa-f0-9]{6}$");
    for (let i = 0; i < 10; i++) {
      expect(randomizeGroupColor()).toMatch(regex);
    }
  });
});
