export const LANGUAGES = ["en", "sv", "es", "ru"] as const;

export type Language = typeof LANGUAGES[number];

export const DEFAULT_LANGUAGE: Language = "es";
export const DEFAULT_TRANSLATION_LANGUAGE: Language = "en";

export type LanguageValues = Record<Language, string>;

export const EMPTY_TRANSLATIONS: LanguageValues = LANGUAGES.reduce(
  (res, l) => ({ ...res, [l]: "" }),
  {} as LanguageValues
);

export const typedLanguageKeys = (languageValues: LanguageValues) =>
  Object.keys(languageValues).map((l) => l as Language);
