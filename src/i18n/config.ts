export const locales = ["gr", "fr", "ro", "hu", "hr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
