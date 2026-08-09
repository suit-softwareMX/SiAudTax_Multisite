import { getCatalog, type Locale, type PageId } from "./i18n";

export const pageMeta = (locale: Locale, page: PageId) => {
  const catalog = getCatalog(locale);
  if (page === "consorcio") return { title: catalog.consortium.metaTitle, description: catalog.consortium.intro };
  if (page === "red-global") return { title: catalog.network.metaTitle, description: catalog.network.intro };
  if (page === "especialidades") return { title: catalog.specialties.metaTitle, description: catalog.specialties.intro };
  if (page === "perspectivas") return { title: catalog.perspectives.metaTitle, description: catalog.perspectives.intro };
  if (page === "contacto") return { title: catalog.contact.metaTitle, description: catalog.contact.intro };
  const legalKey = page === "privacidad" ? "privacy" : page === "terminos" ? "terms" : "ethics";
  return { title: `${catalog.legal[legalKey]} | AUDITAXES`, description: catalog.legal.pages[legalKey].intro };
};
