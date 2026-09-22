import global from "./global.json";
import network from "./network.json";
import shared from "./shared.json";
import site from "./site.json";
import mexico from "./countries/mexico.json";
import salvador from "./countries/salvador.json";

export const countryContent = { mexico, salvador } as const;
export const content = { global, network, shared, site, countries: countryContent } as const;

export type CountryKey = keyof typeof countryContent;
export type PageKey = "global" | CountryKey;
export type Locale = "es" | "en" | "pt" | "fr";

export function isPageKey(value: string): value is PageKey {
  return value === "global" || value in countryContent;
}

export function isLocale(value: string): value is Locale {
  return site.sites.some(page => page.locales.includes(value));
}

export function getCountryContent(country: CountryKey) {
  return countryContent[country];
}
