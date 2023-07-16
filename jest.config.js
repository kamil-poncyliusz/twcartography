export default {
  transform: { "\\.[jt]sx?$": ["ts-jest", { useESM: true }] },
  testEnvironment: "node",
  testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "(.+)\\.js": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
};
