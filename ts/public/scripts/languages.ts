import plTranslations from "./locales/pl.js";
import enTranslations from "./locales/en.js";
import { Translation } from "../../src/types";

export const getPreferredTranslation = function (acceptsLanguages: string[]): Translation {
  const translations: { [key: string]: Translation } = {
    en: enTranslations,
    pl: plTranslations,
  };
  const availableLanguages: string[] = Object.keys(translations);
  for (let language of acceptsLanguages) {
    if (availableLanguages.includes(language)) return translations[language];
  }
  return translations["en"];
};
