export const languages = ["en", "sv", "es", "ru"] as const;

export type Language = typeof languages[number];
