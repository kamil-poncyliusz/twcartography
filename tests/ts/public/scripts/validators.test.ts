import {
  isValidCollectionDescription,
  isValidColor,
  isValidGroupName,
  isValidId,
  isValidLogin,
  isValidMapDescription,
  isValidOutputWidth,
  isValidPassword,
  isValidScale,
  isValidTitle,
  isValidTurn,
  settingsLimits,
} from "../../../../ts/public/scripts/validators";

const exampleString = function (length: number) {
  return "a".repeat(length);
};

describe("isValidCollectionDescription", () => {
  test("Should check if given collection description is valid", () => {
    expect(isValidCollectionDescription("")).toBe(true);
    expect(isValidCollectionDescription(exampleString(500))).toBe(true);
    expect(isValidCollectionDescription(exampleString(501))).toBe(false);
  });
});
describe("isValidColor", () => {
  test("Should check if given color string is valid", () => {
    expect(isValidColor("#000000")).toBe(true);
    expect(isValidColor("#FFFFFF")).toBe(true);
    expect(isValidColor("#808080")).toBe(true);
    expect(isValidColor("808080")).toBe(false);
    expect(isValidColor("#80808")).toBe(false);
    expect(isValidColor("#FFFFFG")).toBe(false);
    expect(isValidColor("#F$FFFF")).toBe(false);
    expect(isValidColor("")).toBe(false);
  });
});
describe("isValidGroupName", () => {
  test("Should check if given group name is valid", () => {
    expect(isValidGroupName("")).toBe(false);
    expect(isValidGroupName("a")).toBe(true);
    expect(isValidGroupName(exampleString(8))).toBe(true);
    expect(isValidGroupName(exampleString(9))).toBe(false);
  });
});
describe("isValidId", () => {
  test("Should check if given id is valid", () => {
    expect(isValidId(-123)).toBe(false);
    expect(isValidId(0)).toBe(false);
    expect(isValidId(1)).toBe(true);
    expect(isValidId(1.23)).toBe(false);
    expect(isValidId(123)).toBe(true);
    expect(isValidId(NaN)).toBe(false);
  });
});
describe("isValidLogin", () => {
  test("Should check if given login is valid", () => {
    expect(isValidLogin("")).toBe(false);
    expect(isValidLogin("a")).toBe(false);
    expect(isValidLogin("aa")).toBe(true);
    expect(isValidLogin(exampleString(15))).toBe(true);
    expect(isValidLogin(exampleString(16))).toBe(false);
  });
});
describe("isValidMapDescription", () => {
  test("Should check if given map description is valid", () => {
    expect(isValidMapDescription("")).toBe(true);
    expect(isValidMapDescription("a")).toBe(true);
    expect(isValidMapDescription(exampleString(200))).toBe(true);
    expect(isValidMapDescription(exampleString(201))).toBe(false);
  });
});
describe("isValidPassword", () => {
  test("Should check if given password is valid", () => {
    expect(isValidPassword("")).toBe(false);
    expect(isValidPassword("a")).toBe(false);
    expect(isValidPassword(exampleString(8))).toBe(true);
    expect(isValidPassword(exampleString(30))).toBe(true);
    expect(isValidPassword(exampleString(31))).toBe(false);
  });
});
describe("isValidOutputWidth", () => {
  test("Should check if given output width is valid", () => {
    expect(isValidOutputWidth(settingsLimits.min.outputWidth - 1)).toBe(false);
    expect(isValidOutputWidth(settingsLimits.min.outputWidth)).toBe(true);
    expect(isValidOutputWidth(settingsLimits.min.outputWidth + 0.5)).toBe(false);
    expect(isValidOutputWidth(settingsLimits.max.outputWidth)).toBe(true);
    expect(isValidOutputWidth(settingsLimits.max.outputWidth + 1)).toBe(false);
  });
});
describe("isValidScale", () => {
  test("Should check if given output scale is valid", () => {
    expect(isValidScale(settingsLimits.min.scale - 1)).toBe(false);
    expect(isValidScale(settingsLimits.min.scale)).toBe(true);
    expect(isValidScale(settingsLimits.min.scale + 0.5)).toBe(false);
    expect(isValidScale(settingsLimits.max.scale)).toBe(true);
    expect(isValidScale(settingsLimits.max.scale + 1)).toBe(false);
  });
});
describe("isValidTitle", () => {
  test("Should check if given title is valid", () => {
    expect(isValidTitle("")).toBe(false);
    expect(isValidTitle("a")).toBe(true);
    expect(isValidTitle(exampleString(20))).toBe(true);
    expect(isValidTitle(exampleString(21))).toBe(false);
  });
});
describe("isValidTurn", () => {
  test("Should check if given turn is valid", () => {
    expect(isValidTurn(-123)).toBe(false);
    expect(isValidTurn(0)).toBe(true);
    expect(isValidTurn(1)).toBe(true);
    expect(isValidTurn(1.23)).toBe(false);
    expect(isValidTurn(123)).toBe(true);
    expect(isValidTurn(NaN)).toBe(false);
  });
});
