import { VocItem } from "@prisma/client";

export const LANGUAGES = ["en", "sv", "es", "ru"] as const;

export type Language = typeof LANGUAGES[number];

export const DEFAULT_LANGUAGE: Language = "es";
export const DEFAULT_TRANSLATION_LANGUAGE: Language = "en";

export type LanguageValues = Map<Language, string>;

export const createEmptyLanguageValues = (): LanguageValues =>
  new Map(LANGUAGES.map((l) => [l, ""]));

export const createLanguageValuesFromVocItems = (
  vocItems: VocItem[]
): LanguageValues => {
  const currentValues = new Map(
    vocItems.reduce(
      (acc, item) => [...acc, [item.language as Language, item.value]],
      [] as [Language, string][]
    )
  );
  return new Map(LANGUAGES.map((l) => [l, currentValues.get(l) || ""]));
};

export const mapLanguageValues = (values: LanguageValues): VocItem[] =>
  [...values.entries()]
    .map(([language, value]) => ({
      value,
      language,
    }))
    .filter((t) => t.value.length > 0);
