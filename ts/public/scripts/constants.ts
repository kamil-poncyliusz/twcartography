export const GENERATOR_CONTROLLER_DEFAULTS = {
  BACKGROUND_COLOR: "#202020",
  BORDER_COLOR: "#808080",
  DISPLAY_UNMARKED: false,
  OUTPUT_WIDTH: 500,
  SCALE: 2,
  SPOTS_FILTER: 8,
  TRIM: true,
  UNMARKED_COLOR: "#808080",
};

export const MAX_TRIBE_SUGGESTIONS = 20;

export const COLOR_RANDOMIZER_DEFAULTS = {
  MIN_SATURATION: 45,
  MAX_SATURATION: 90,
  MIN_LIGHTNESS: 20,
  MAX_LIGHTNESS: 60,
};

export const MAX_VILLAGE_POINTS = 12154;
export const LEGEND_FONT_SIZE = 5;
export const LEGEND_FONT_FAMILY = "sans-serif";
export const TRIBAL_WARS_MAP_SIZE = 1000;

export const MAP_IMAGES_DIRECTORY = "/images/maps";

const SETTINGS_MIN_VALUES: { [key: string]: number } = {
  outputWidth: 100,
  scale: 1,
  spotsFilter: 1,
};
const SETTINGS_MAX_VALUES: { [key: string]: number } = {
  outputWidth: 1000,
  scale: 5,
  spotsFilter: 400,
};

export const SETTINGS_LIMITS = {
  MIN: SETTINGS_MIN_VALUES,
  MAX: SETTINGS_MAX_VALUES,
};

export const GROUP_NAME_FORBIDDEN_CHARACTERS = "#^,;";
export const GROUP_NAME_MAX_LENGTH = 8;
export const GROUP_NAME_MIN_LENGTH = 1;
