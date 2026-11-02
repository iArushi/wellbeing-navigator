import { CONCERN_TAXONOMY } from "./dataset";
import { CONCERN_TAGS, type ConcernSignal, type ConcernTag } from "./types";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesKeyword(text: string, keyword: string) {
  const normalized = keyword.toLowerCase().trim();

  if (!normalized) {
    return false;
  }

  if (normalized.includes(" ")) {
    return text.includes(normalized);
  }

  return new RegExp(`\\b${escapeRegExp(normalized)}\\b`).test(text);
}

export function validateConcernThemes(values: unknown): ConcernTag[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const unique = new Set<ConcernTag>();

  for (const value of values) {
    if (typeof value === "string" && CONCERN_TAGS.includes(value as ConcernTag)) {
      unique.add(value as ConcernTag);
    }
  }

  return [...unique];
}

export function deriveConcernTags(
  text: string,
  themes?: readonly string[],
): ConcernSignal {
  const fromInterpretation = validateConcernThemes(themes);

  if (fromInterpretation.length > 0) {
    return {
      tags: fromInterpretation,
      reliable: true,
      source: "interpretation",
    };
  }

  const normalized = text.toLowerCase();
  const tags = CONCERN_TAXONOMY.filter((theme) =>
    theme.keywords.some((keyword) => matchesKeyword(normalized, keyword)),
  ).map((theme) => theme.id as ConcernTag);

  return {
    tags,
    reliable: tags.length > 0,
    source: tags.length > 0 ? "keywords" : "none",
  };
}
