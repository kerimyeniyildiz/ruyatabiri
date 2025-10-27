const charMap: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

const WHITESPACE_REGEX = /\s+/g;
const NON_ALNUM_REGEX = /[^a-z0-9-]+/g;

export function normalizeTitle(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => charMap[char] ?? char)
    .replace(/[^\w\s-]+/g, "")
    .replace(WHITESPACE_REGEX, " ")
    .trim();
}

export function slugifyTr(input: string): string {
  const normalized = normalizeTitle(input);
  return normalized
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(NON_ALNUM_REGEX, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
