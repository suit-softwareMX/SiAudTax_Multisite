export const AI_MAX_FIELDS = 60;
export const AI_MAX_TEXT = 4000;
export const ARTICLE_MAX_TEXT = 12000;
export const ARTICLE_MAX_HTML = 60000;

const limits = {
  title: 180, name: 180, role: 180, label: 180, eyebrow: 100, actionlabel: 120,
  alt: 250, summary: 500, email: 254, contactemail: 254,
  phone: 50, phones: 50, contactphone: 50, whatsapp: 50, suffix: 30,
  src: 2048, href: 2048, url: 2048, sourceurl: 2048,
  facebook: 2048, instagram: 2048, linkedin: 2048, youtube: 2048,
};

export function fieldLimit(path) {
  const key = path.findLast(part=>typeof part === "string" && !["es", "en", "pt", "fr"].includes(part))?.toLowerCase();
  return Object.hasOwn(limits, key) ? limits[key] : 1600;
}

export function aiLimitError(fields, singleFieldPath) {
  const entries = Object.entries(fields);
  if (entries.length > AI_MAX_FIELDS) return `La IA admite hasta ${AI_MAX_FIELDS} campos por trabajo.`;
  let total = 0;
  for (const [key, text] of entries) {
    const path = singleFieldPath ?? JSON.parse(key);
    const limit = fieldLimit(path);
    if (text.length > limit) return `Un campo excede su límite de ${limit} caracteres. Acorta el texto antes de enviarlo a la IA.`;
    total += text.length;
  }
  if (total > AI_MAX_TEXT) return `La IA admite hasta ${AI_MAX_TEXT} caracteres por idioma y trabajo.`;
  return null;
}
