export function mentionsDuration(text: string): boolean {
  const normalized = text.toLowerCase();

  const durationPatterns = [
    /\b\d+\s+(?:day|days|week|weeks|month|months|year|years)\b/,
    /\b(?:a|an|few|several|many|couple(?:\s+of)?)\s+(?:day|days|week|weeks|month|months|year|years)\b/,
    /\b(?:last|past|previous)\s+(?:\d+\s+)?(?:day|days|week|weeks|month|months|year|years)\b/,
    /\b(?:since|for|over|about|around)\s+(?:the\s+)?(?:last|past)?\s*(?:\d+\s+)?(?:day|days|week|weeks|month|months|year|years)\b/,
    /\ba long time\b/,
    /\bfor a while\b/,
  ];

  return durationPatterns.some((pattern) => pattern.test(normalized));
}

export function isQuestionCoveredByInitialConcern(
  questionId: string,
  initialConcern: string,
): boolean {
  if (questionId === "duration") {
    return mentionsDuration(initialConcern);
  }

  return false;
}
