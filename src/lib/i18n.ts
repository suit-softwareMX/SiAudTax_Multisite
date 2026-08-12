import es from "../data/catalogs/es.json";
import en from "../data/catalogs/en.json";
import pt from "../data/catalogs/pt.json";
import fr from "../data/catalogs/fr.json";

export const locales = ["es", "en", "pt", "fr"] as const;
export type Locale = (typeof locales)[number];
export type Catalog = typeof es;

const catalogs: Record<Locale, Catalog> = { es, en, pt, fr };

export const getCatalog = (locale: Locale) => catalogs[locale];
export const isLocale = (value: string | undefined): value is Locale => locales.includes(value as Locale);

export const pageIds = ["consorcio", "red-global", "especialidades", "perspectivas", "contacto", "privacidad", "terminos", "etica"] as const;
export type PageId = (typeof pageIds)[number];

export const localizedPath = (locale: Locale, page?: PageId) => {
  const prefix = locale === "es" ? "" : `/${locale}`;
  return page ? `${prefix}/${page}/` : `${prefix || ""}/`;
};

export const htmlLang = (locale: Locale) => (locale === "pt" ? "pt-BR" : locale);
