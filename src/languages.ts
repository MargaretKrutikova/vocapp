export const LANGUAGES = ["en", "sv", "es", "ru"] as const;

export type Language = typeof LANGUAGES[number];

export const DEFAULT_LANGUAGE: Language = "es";
export const DEFAULT_TRANSLATION_LANGUAGE: Language = "en";

export type LanguageValues = Map<Language, string>;

export const EMPTY_TRANSLATIONS: LanguageValues = new Map(
  LANGUAGES.map((l) => [l, ""])
);
